import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { isUUID } from 'class-validator';

@ApiTags('Airports')
@Controller('airports')
export class AirportsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('cityId') cityId?: string,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }
    if (cityId && !isUUID(cityId)) {
      throw new BadRequestException('cityId must be a valid UUID');
    }

    const [items, total] = await this.service.listAirports(pageNum, limitNum, cityId);
    return { total, page: pageNum, limit: limitNum, items };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getAirport(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateAirportDto) {
    return this.service.createAirport(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAirportDto) {
    return this.service.updateAirport(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeAirport(id);
  }
}
