import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { SearchFlightsDto } from './dto/search-flights.dto';

@ApiTags('Flights')
@Controller('search')
export class GlobalSearchController {
  constructor(private readonly flights: FlightsService) {}

  @Get()
  run(@Query() q: SearchFlightsDto) {
    return this.flights.search(q);
  }
}
