import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { Airport } from './entities/airport.entity';
import { LocationsService } from './locations.service';
import { AirportsController } from './airports.controller';
import { CountriesController } from './countries.controller';
import { CitiesController } from './cities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City, Airport])],
  providers: [LocationsService],
  controllers: [AirportsController, CountriesController, CitiesController],
  exports: [TypeOrmModule],
})
export class LocationsModule {}
