import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Plane } from './entities/plane.entity';
import { Seat } from './entities/seat.entity';
import { CompaniesService } from './companies.service';
import { TravelClass } from '../classes/entities/travel-class.entity';
import { CompaniesController } from './companies.controller';
import { PlanesController } from './planes.controller';
import { SeatsController } from './seats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Plane, Seat, TravelClass])],
  providers: [CompaniesService],
  controllers: [CompaniesController, PlanesController, SeatsController],
  exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule {}
