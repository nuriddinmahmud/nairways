import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { CreatePlaneWithCompanyDto } from './dto/create-plane-with-company.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';

@ApiTags('Planes')
@Controller('planes')
export class PlanesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 50) {
    const [items, total] = await this.service.listAllPlanes(Number(page), Number(limit));
    return { total, page: Number(page), limit: Number(limit), items };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getPlane(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreatePlaneWithCompanyDto) {
    return this.service.createPlaneGlobal(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaneDto) {
    return this.service.updatePlaneGlobal(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removePlaneGlobal(id);
  }
}
