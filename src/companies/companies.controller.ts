import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  findCompanies() {
    return this.service.findCompanies();
  }

  @Get(':companyId')
  findCompany(@Param('companyId') companyId: string) {
    return this.service.findCompanyById(companyId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  createCompany(@Body() dto: CreateCompanyDto) {
    return this.service.createCompany(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':companyId')
  updateCompany(@Param('companyId') companyId: string, @Body() dto: UpdateCompanyDto) {
    return this.service.updateCompany(companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':companyId')
  removeCompany(@Param('companyId') companyId: string) {
    return this.service.removeCompany(companyId);
  }

  @Get(':companyId/planes')
  findPlanes(@Param('companyId') companyId: string) {
    return this.service.findPlanes(companyId);
  }

  @Get(':companyId/planes/:planeId')
  findPlane(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
  ) {
    return this.service.findPlaneById(companyId, planeId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':companyId/planes')
  createPlane(
    @Param('companyId') companyId: string,
    @Body() dto: CreatePlaneDto,
  ) {
    return this.service.createPlane(companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':companyId/planes/:planeId')
  updatePlane(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
    @Body() dto: UpdatePlaneDto,
  ) {
    return this.service.updatePlane(companyId, planeId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':companyId/planes/:planeId')
  removePlane(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
  ) {
    return this.service.removePlane(companyId, planeId);
  }

  @Get(':companyId/planes/:planeId/seats')
  findSeats(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
  ) {
    return this.service.findSeats(companyId, planeId);
  }

  @Get(':companyId/planes/:planeId/seats/:seatId')
  findSeat(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
    @Param('seatId') seatId: string,
  ) {
    return this.service.findSeatById(companyId, planeId, seatId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':companyId/planes/:planeId/seats')
  createSeat(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
    @Body() dto: CreateSeatDto,
  ) {
    return this.service.createSeat(companyId, planeId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':companyId/planes/:planeId/seats/:seatId')
  updateSeat(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
    @Param('seatId') seatId: string,
    @Body() dto: UpdateSeatDto,
  ) {
    return this.service.updateSeat(companyId, planeId, seatId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':companyId/planes/:planeId/seats/:seatId')
  removeSeat(
    @Param('companyId') companyId: string,
    @Param('planeId') planeId: string,
    @Param('seatId') seatId: string,
  ) {
    return this.service.removeSeat(companyId, planeId, seatId);
  }
}
