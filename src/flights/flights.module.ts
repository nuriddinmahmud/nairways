import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { GlobalSearchController } from './search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from './entities/flight.entity';
import { Airport } from '../locations/entities/airport.entity';
import { Plane } from '../companies/entities/plane.entity';
import { Company } from '../companies/entities/company.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Airport, Plane, Company, Booking])],
  controllers: [FlightsController, GlobalSearchController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}
