import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 50) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!Number.isInteger(pageNum) || pageNum < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (!Number.isInteger(limitNum) || limitNum < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }

    const [items, total] = await this.service.listCountries(pageNum, limitNum);
    return { total, page: pageNum, limit: limitNum, items };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getCountry(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateCountryDto) {
    return this.service.createCountry(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCountryDto) {
    return this.service.updateCountry(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeCountry(id);
  }
}
