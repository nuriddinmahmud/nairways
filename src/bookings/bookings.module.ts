import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Flight } from '../flights/entities/flight.entity';
import { Seat } from '../companies/entities/seat.entity';
import { TravelClass } from '../classes/entities/travel-class.entity';
import { UsersModule } from '../users/users.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Flight, Seat, TravelClass]),
    UsersModule,
    LoyaltyModule,
    MailModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
