import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository, DataSource, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Flight } from '../flights/entities/flight.entity';
import { Seat } from '../companies/entities/seat.entity';
import { TravelClass } from '../classes/entities/travel-class.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PaymentMock } from './payment.mock';
import { PaymentStatus } from '../common/constants';
import { UsersService } from '../users/users.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../mail/mail.service';
import { UpdateBookingAdminDto } from './dto/update-booking.dto';
import { AssignSeatDto } from './dto/assign-seat.dto';
import { ChangeSeatDto } from './dto/change-seat.dto';

@Injectable()
export class BookingsService {
  constructor(
    private ds: DataSource,
    @InjectRepository(Booking) private repo: Repository<Booking>,
    @InjectRepository(Flight) private flightRepo: Repository<Flight>,
    @InjectRepository(Seat) private seatRepo: Repository<Seat>,
    @InjectRepository(TravelClass) private classRepo: Repository<TravelClass>,
    private usersService: UsersService,
    private loyaltyService: LoyaltyService,
    private mail: MailService,
  ) {}

  async myBookings(userId: string, page = 1, limit = 20) {
    const [rows, total] = await this.repo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items: rows };
  }

  async listAll(page = 1, limit = 50) {
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      relations: { user: true, flight: true, seat: true, travelClass: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items: rows };
  }

  async findById(id: string) {
    const booking = await this.repo.findOne({
      where: { id },
      relations: { user: true, flight: true, seat: true, travelClass: true },
      withDeleted: true,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateByAdmin(id: string, dto: UpdateBookingAdminDto) {
    const booking = await this.findById(id);

    if (dto.paymentStatus) booking.paymentStatus = dto.paymentStatus;
    if (dto.price !== undefined) booking.price = dto.price;
    if (dto.meta !== undefined) booking.meta = dto.meta;
    if (dto.isRoundTrip !== undefined) booking.isRoundTrip = dto.isRoundTrip;

    return this.repo.save(booking);
  }

  async removeByAdmin(id: string) {
    await this.findById(id);
    await this.repo.softDelete(id);
    return { id };
  }

  async create(userId: string, dto: CreateBookingDto) {
    const user = await this.usersService.findById(userId);
    const flight = await this.flightRepo.findOne({
      where: { id: dto.flightId },
      relations: { plane: { seats: { travelClass: true } }, bookings: true },
    });
    if (!flight) throw new NotFoundException('Flight not found');
    if (new Date(flight.departureTime) <= new Date())
      throw new BadRequestException('Flight already departed');

    const klass = await this.classRepo.findOne({ where: { name: dto.class } });
    if (!klass) throw new BadRequestException('Invalid class');

    let seat: Seat | null = null;
    if (dto.seatId) {
      seat = await this.seatRepo.findOne({ where: { id: dto.seatId }, relations: { travelClass: true, plane: true } });
    } else if (dto.seatNumber) {
      seat = flight.plane.seats.find((s) => s.seatNumber === dto.seatNumber) || null;
    }
    if (!seat || seat.plane.id !== flight.plane.id) {
      throw new BadRequestException('Seat invalid for this flight plane');
    }
    if (seat.travelClass.id !== klass.id) {
      throw new BadRequestException('Seat class mismatch');
    }

    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // Re-check with lock by unique index (will throw 23505 if already booked)
      const baseFare = Number(flight.basePrice);
      const classSurcharge = Number(klass.basePrice ?? 0);
      const multiplierFare = this.calcPrice(baseFare, Number(klass.multiplier));
      const price = Number((multiplierFare + classSurcharge).toFixed(2));
      const redeemPoints = Math.max(0, Math.min(dto.redeemPoints || 0, user.loyaltyPoints));
      const redeemValue = Math.floor(redeemPoints / 100) * 10;
      const finalPrice = Math.max(0, price - redeemValue);

      let booking = queryRunner.manager.create(Booking, {
        user,
        flight,
        seat,
        travelClass: klass,
        isRoundTrip: !!dto.isRoundTrip,
        price: finalPrice,
        paymentStatus: finalPrice === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        meta: { base: price, redeemPoints, redeemValue, taxes: 0.12 },
      });
      booking = await queryRunner.manager.save(booking);

      if (finalPrice > 0) {
        const pay = await PaymentMock.charge(finalPrice, { bookingId: booking.id });
        if (!pay.success) throw new BadRequestException('Payment failed');

        booking.paymentStatus = PaymentStatus.PAID;
        booking.meta = { ...booking.meta, txnId: pay.txnId };
        await queryRunner.manager.save(booking);

        const currentBalance = Number(user.balance ?? 0);
        if (currentBalance < finalPrice) {
          throw new BadRequestException('Insufficient balance');
        }
        user.balance = Math.round((currentBalance - finalPrice) * 100) / 100;
        await queryRunner.manager.save(User, user);
      }

      if (redeemPoints > 0) {
        await this.loyaltyService.redeemPoints(user.id, redeemPoints, queryRunner.manager);
      }
      const earn = Math.floor(price / 10);
      if (earn > 0) {
        await this.loyaltyService.earnPoints(user.id, earn, `Booking ${booking.id}`, queryRunner.manager);
      }

      if (dto.isRoundTrip) {
        if (!dto.returnFlightId || !dto.returnSeatId) {
          throw new BadRequestException('Return flight and seat required for round-trip');
        }
        const retFlight = await queryRunner.manager.findOneByOrFail(Flight, { id: dto.returnFlightId });
        const retSeat = await queryRunner.manager.findOneByOrFail(Seat, { id: dto.returnSeatId });
        const retPrice = this.calcPrice(Number(retFlight.basePrice), Number(klass.multiplier));
        const retBooking = await queryRunner.manager.save(Booking, {
          user,
          flight: retFlight,
          seat: retSeat,
          travelClass: klass,
          isRoundTrip: true,
          linkedBookingId: booking.id,
          price: retPrice,
          paymentStatus: PaymentStatus.PAID,
          meta: { txnId: 'MOCK-ROUNDTRIP' },
        });
        booking.linkedBookingId = retBooking.id;
        await queryRunner.manager.save(booking);
      }

      await queryRunner.commitTransaction();

      this.mail.send(user.email, 'Booking confirmed', `Your booking ${booking.id} is confirmed.`);

      return booking;
    } catch (e: any) {
      await queryRunner.rollbackTransaction();
      if (e?.code === '23505') {
        throw new BadRequestException('Seat already booked');
      }
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  private calcPrice(base: number, mult: number) {
    const fare = base * mult;
    const taxes = fare * 0.12;
    return Math.round((fare + taxes) * 100) / 100;
  }

  async cancel(userId: string, bookingId: string, reason: string) {
    const booking = await this.repo.findOne({ where: { id: bookingId }, relations: { user: true, flight: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) throw new ForbiddenException('Not your booking');
    if (booking.paymentStatus !== PaymentStatus.PAID)
      throw new BadRequestException('Only paid bookings can be cancelled');
    if (new Date(booking.flight.departureTime) <= new Date())
      throw new BadRequestException('Cannot cancel after departure');

    const hoursLeft =
      (new Date(booking.flight.departureTime).getTime() - Date.now()) / 3600000;
    let refundRate = 1.0;
    if (hoursLeft < 24) refundRate = 0.1;
    else if (hoursLeft < 48) refundRate = 0.5;

    booking.paymentStatus = PaymentStatus.REFUNDED;
    booking.meta = { ...booking.meta, refundRate, refundReason: reason };
    await this.repo.save(booking);

    const earned = Math.floor((booking.meta?.base ?? booking.price) / 10);
    if (earned > 0) {
      await this.loyaltyService.redeemPoints(userId, Math.min(earned, 999999), undefined, `Refund of booking ${booking.id}`);
    }

    this.mail.send(booking.user.email, 'Booking cancelled', `Booking ${booking.id} has been cancelled. Refund ${(refundRate * 100).toFixed(0)}%`);
    return { refundRate };
  }

  async seatMap(flightId: string) {
    const flight = await this.flightRepo.findOne({
      where: { id: flightId },
      relations: { plane: { seats: { travelClass: true } } },
    });
    if (!flight) throw new NotFoundException('Flight not found');

    const bookedSeats = await this.repo.find({
      where: { flight: { id: flightId } as any },
      relations: { seat: true },
    });
    const occupied = new Set(
      bookedSeats
        .filter((b) => [PaymentStatus.PAID, PaymentStatus.PENDING].includes(b.paymentStatus))
        .map((b) => b.seat.id),
    );

    const seats = flight.plane.seats.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      travelClass: seat.travelClass.name,
      isActive: seat.isActive,
      isAvailable: seat.isActive && !occupied.has(seat.id),
    }));

    return { flightId, planeId: flight.plane.id, seats };
  }

  async assignSeat(userId: string, bookingId: string, dto: AssignSeatDto) {
    const booking = await this.repo.findOne({
      where: { id: bookingId },
      relations: { user: true, flight: { plane: true }, seat: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) throw new ForbiddenException('Not your booking');
    if (booking.paymentStatus !== PaymentStatus.PENDING)
      throw new BadRequestException('Seat assignment allowed only for pending bookings');

    const seat = await this.seatRepo.findOne({ where: { id: dto.seatId }, relations: { plane: true } });
    if (!seat) throw new NotFoundException('Seat not found');
    if (seat.plane.id !== booking.flight.plane.id)
      throw new BadRequestException('Seat belongs to a different plane');

    booking.seat = seat;
    return this.repo.save(booking);
  }

  async changeSeat(userId: string, bookingId: string, dto: ChangeSeatDto) {
    const booking = await this.repo.findOne({
      where: { id: bookingId },
      relations: { user: true, flight: { plane: true }, seat: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) throw new ForbiddenException('Not your booking');
    if (booking.paymentStatus !== PaymentStatus.PAID)
      throw new BadRequestException('Only paid bookings can change seat');

    const seat = await this.seatRepo.findOne({ where: { id: dto.newSeatId }, relations: { plane: true } });
    if (!seat) throw new NotFoundException('Seat not found');
    if (!seat.isActive) throw new BadRequestException('Seat inactive');
    if (seat.plane.id !== booking.flight.plane.id)
      throw new BadRequestException('Seat belongs to a different plane');

    booking.seat = seat;
    return this.repo.save(booking);
  }
}
