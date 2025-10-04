import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { CreateSeatWithPlaneDto } from './dto/create-seat-with-plane.dto';
import { UpdateSeatWithPlaneDto } from './dto/update-seat-with-plane.dto';

@ApiTags('Seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 100,
    @Query('planeId') planeId?: string,
  ) {
    const [items, total] = await this.service.listSeatsGlobal(Number(page), Number(limit), planeId);
    return { total, page: Number(page), limit: Number(limit), items };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getSeat(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateSeatWithPlaneDto) {
    return this.service.createSeatGlobal(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeatWithPlaneDto) {
    return this.service.updateSeatGlobal(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeSeatGlobal(id);
  }
}
