import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FlightsService } from '../flights/flights.service';
import { NewsService } from '../news/news.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { CreateFlightDto } from '../flights/dto/create-flight.dto';
import { CancelFlightDto } from '../flights/dto/cancel-flight.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly flights: FlightsService, private readonly news: NewsService) {}

  @Get('flights')
  flightsList(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.flights.findAll(Number(page), Number(limit));
  }

  @Post('flights')
  createFlight(@Body() dto: CreateFlightDto) {
    return this.flights.create(dto);
  }

  @Post('flights/:id/cancel')
  cancelFlight(@Param('id') id: string, @Body() dto: CancelFlightDto) {
    return this.flights.cancel(id, dto.reason);
  }

  @Get('news')
  newsList(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.news.listAdmin(Number(page), Number(limit));
  }
}
