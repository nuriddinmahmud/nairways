import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Repository, Between } from 'typeorm';
import { Airport } from '../locations/entities/airport.entity';
import { Plane } from '../companies/entities/plane.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { TravelClassName, PaymentStatus, FlightStatus } from '../common/constants';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight) private flightRepo: Repository<Flight>,
    @InjectRepository(Company) private compRepo: Repository<Company>,
    @InjectRepository(Airport) private airportRepo: Repository<Airport>,
    @InjectRepository(Plane) private planeRepo: Repository<Plane>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async search(q: SearchFlightsDto) {
    const dep = await this.airportRepo.findOne({ where: { code: q.from } });
    const arr = await this.airportRepo.findOne({ where: { code: q.to } });
    if (!dep || !arr) throw new BadRequestException('Invalid airport code');

    const dateStart = new Date(q.date);
    const dateEnd = new Date(q.date);
    dateEnd.setUTCHours(23, 59, 59, 999);

    const result = await this.flightRepo.find({
      where: {
        departureAirport: { id: dep.id },
        arrivalAirport: { id: arr.id },
        departureTime: Between(dateStart, dateEnd),
      },
      order: { departureTime: 'ASC' },
    });

    const filtered = result.filter((f) => {
      if (q.maxPrice && Number(f.basePrice) > q.maxPrice) return false;
      return true;
    });

    const enriched = await Promise.all(filtered.map(async (f) => {
      const activeBookings = await this.bookingRepo.count({
        where: { flight: { id: f.id } as any, paymentStatus: PaymentStatus.PAID as any },
      });
      return {
        ...f,
        prices: {
          ECONOM: Number(f.basePrice) * 1.0,
          BUSINESS: Number(f.basePrice) * 1.5,
          VIP: Number(f.basePrice) * 2.0,
        },
        availableSeatsEstimate: f.plane.totalSeats - activeBookings,
      };
    }));

    return enriched;
  }

  async create(dto: CreateFlightDto) {
    const [company, dep, arr, plane] = await Promise.all([
      this.compRepo.findOneBy({ id: dto.companyId }),
      this.airportRepo.findOneBy({ id: dto.departureAirportId }),
      this.airportRepo.findOneBy({ id: dto.arrivalAirportId }),
      this.planeRepo.findOne({
        where: { id: dto.planeId },
        relations: { seats: { travelClass: true } },
      }),
    ]);
    if (!company || !dep || !arr || !plane) throw new BadRequestException('Invalid FK');

    const depTime = new Date(dto.departureTime);
    const arrTime = new Date(dto.arrivalTime);
    if (depTime <= new Date()) throw new BadRequestException('Departure must be in future');
    if (arrTime <= depTime) throw new BadRequestException('Arrival after departure required');

    const flight = this.flightRepo.create({
      flightNumber: dto.flightNumber,
      company,
      departureAirport: dep,
      arrivalAirport: arr,
      departureTime: depTime,
      arrivalTime: arrTime,
      plane,
      status: dto.status,
      basePrice: dto.basePrice as any,
    });
    return this.flightRepo.save(flight);
  }

  async update(id: string, dto: UpdateFlightDto) {
    const flight = await this.flightRepo.findOne({
      where: { id },
      relations: { plane: true, company: true, departureAirport: true, arrivalAirport: true },
    });
    if (!flight) throw new NotFoundException('Flight not found');

    if (dto.departureTime) {
      const d = new Date(dto.departureTime);
      if (d <= new Date()) throw new BadRequestException('Departure must be in future');
      flight.departureTime = d;
    }
    if (dto.arrivalTime) {
      const a = new Date(dto.arrivalTime);
      if (a <= flight.departureTime) throw new BadRequestException('Arrival after departure required');
      flight.arrivalTime = a;
    }
    if (dto.status) flight.status = dto.status;
    if (dto.basePrice) flight.basePrice = dto.basePrice as any;

    return this.flightRepo.save(flight);
  }

  async seatMap(flightId: string, klass?: TravelClassName) {
    const flight = await this.flightRepo.findOne({
      where: { id: flightId },
      relations: { plane: { seats: { travelClass: true } } },
    });
    if (!flight) throw new NotFoundException('Flight not found');

    const seats = flight.plane.seats
      .filter((s) => s.isActive && (!klass || s.travelClass.name === klass))
      .map((s) => s.seatNumber);

    const booked = (await this.bookingRepo.find({
      where: { flight: { id: flight.id } as any },
      relations: { seat: true },
    }))
      .filter((b) => b.paymentStatus === 'PENDING' || b.paymentStatus === 'PAID')
      .map((b) => b.seat.seatNumber);

    const available = seats.filter((s) => !booked.includes(s));
    return { flightId, planeId: flight.plane.id, availableSeats: available };
  }

  async findAll(page = 1, limit = 20) {
    const [items, total] = await this.flightRepo.findAndCount({
      order: { departureTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async findOne(id: string) {
    const flight = await this.flightRepo.findOne({ where: { id } });
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async remove(id: string) {
    const flight = await this.findOne(id);
    await this.flightRepo.remove(flight);
    return { id };
  }

  async cancel(id: string, reason?: string) {
    const flight = await this.findOne(id);
    if (flight.status === FlightStatus.CANCELLED) {
      return flight;
    }
    flight.status = FlightStatus.CANCELLED;
    if (reason) {
      flight.cancelReason = reason;
    }
    return this.flightRepo.save(flight);
  }
}
