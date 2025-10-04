import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Flight } from '../flights/entities/flight.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Flight, Booking])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
