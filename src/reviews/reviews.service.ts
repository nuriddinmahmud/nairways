import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { Flight } from '../flights/entities/flight.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { PaymentStatus, UserRole } from '../common/constants';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private repo: Repository<Review>,
    @InjectRepository(Flight) private flightRepo: Repository<Flight>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async post(userId: string, flightId: string, rating: number, comment?: string) {
    const flight = await this.flightRepo.findOneBy({ id: flightId });
    if (!flight) throw new NotFoundException('Flight not found');
    if (new Date(flight.arrivalTime) > new Date())
      throw new BadRequestException('You can review only after the flight has arrived');

    const hadBooking = await this.bookingRepo.count({
      where: { user: { id: userId } as any, flight: { id: flightId } as any, paymentStatus: PaymentStatus.PAID as any },
    });
    if (!hadBooking) throw new BadRequestException('Only passengers can review');

    const review = this.repo.create({ user: { id: userId } as any, flight: { id: flightId } as any, rating, comment });
    return this.repo.save(review);
  }

  async listForFlight(flightId: string, page = 1, limit = 20) {
    const [rows, total] = await this.repo.findAndCount({
      where: { flight: { id: flightId } as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { user: true },
    });
    const agg = await this.repo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('r.flightId = :flightId', { flightId })
      .getRawOne();
    const avg = agg?.avg ? Number(Number(agg.avg).toFixed(2)) : 0;
    return { total, page, limit, avgRating: avg, items: rows };
  }

  async listAll(page = 1, limit = 20) {
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { user: true, flight: true },
    });
    return { total, page, limit, items: rows };
  }

  async getById(id: string) {
    const review = await this.repo.findOne({ where: { id }, relations: { user: true, flight: true } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, userId: string, dto: UpdateReviewDto, role: UserRole) {
    const review = await this.repo.findOne({ where: { id }, relations: { user: true } });
    if (!review) throw new NotFoundException('Review not found');

    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role);
    if (!isAdmin && review.user.id !== userId) {
      throw new ForbiddenException('Cannot edit others reviews');
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }
    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    return this.repo.save(review);
  }

  async remove(id: string, userId: string, allowAdmin: boolean) {
    const review = await this.repo.findOne({ where: { id }, relations: { user: true } });
    if (!review) throw new NotFoundException('Review not found');
    if (!allowAdmin && review.user.id !== userId) {
      throw new ForbiddenException('Cannot delete others reviews');
    }
    await this.repo.remove(review);
    return { id };
  }
}
