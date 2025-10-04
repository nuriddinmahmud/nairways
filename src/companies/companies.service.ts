import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Plane } from './entities/plane.entity';
import { Seat } from './entities/seat.entity';
import { Repository } from 'typeorm';
import { TravelClass } from '../classes/entities/travel-class.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { CreatePlaneWithCompanyDto } from './dto/create-plane-with-company.dto';
import { CreateSeatWithPlaneDto } from './dto/create-seat-with-plane.dto';
import { UpdateSeatWithPlaneDto } from './dto/update-seat-with-plane.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companies: Repository<Company>,
    @InjectRepository(Plane) private planes: Repository<Plane>,
    @InjectRepository(Seat) private seats: Repository<Seat>,
    @InjectRepository(TravelClass) private travelClasses: Repository<TravelClass>,
  ) {}

  findCompanies() {
    return this.companies.find({ order: { name: 'ASC' } });
  }

  async findCompanyById(id: string) {
    const company = await this.companies.findOne({ where: { id }, relations: { planes: true } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async createCompany(dto: CreateCompanyDto) {
    const entity = this.companies.create(dto);
    return this.companies.save(entity);
  }

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    const entity = await this.companies.preload({ id, ...dto });
    if (!entity) throw new NotFoundException('Company not found');
    return this.companies.save(entity);
  }

  async removeCompany(id: string) {
    const company = await this.findCompanyById(id);
    await this.companies.remove(company);
    return { id };
  }

  findPlanes(companyId: string) {
    return this.planes.find({ where: { company: { id: companyId } }, order: { model: 'ASC' } });
  }

  async findPlaneById(companyId: string, planeId: string) {
    const plane = await this.planes.findOne({
      where: { id: planeId, company: { id: companyId } },
      relations: { seats: true },
    });
    if (!plane) throw new NotFoundException('Plane not found');
    return plane;
  }

  async createPlane(companyId: string, dto: CreatePlaneDto) {
    const company = await this.findCompanyById(companyId);
    const plane = this.planes.create({ ...dto, company });
    return this.planes.save(plane);
  }

  async updatePlane(companyId: string, planeId: string, dto: UpdatePlaneDto) {
    const plane = await this.findPlaneById(companyId, planeId);
    Object.assign(plane, dto);
    return this.planes.save(plane);
  }

  async removePlane(companyId: string, planeId: string) {
    const plane = await this.findPlaneById(companyId, planeId);
    await this.planes.remove(plane);
    return { id: planeId };
  }

  async findSeats(companyId: string, planeId: string) {
    await this.findPlaneById(companyId, planeId);
    return this.seats.find({ where: { plane: { id: planeId } }, order: { seatNumber: 'ASC' } });
  }

  async findSeatById(companyId: string, planeId: string, seatId: string) {
    await this.findPlaneById(companyId, planeId);
    const seat = await this.seats.findOne({
      where: { id: seatId, plane: { id: planeId } },
      relations: { travelClass: true },
    });
    if (!seat) throw new NotFoundException('Seat not found');
    return seat;
  }

  async createSeat(companyId: string, planeId: string, dto: CreateSeatDto) {
    const plane = await this.findPlaneById(companyId, planeId);
    const travelClass = await this.travelClasses.findOne({ where: { id: dto.travelClassId } });
    if (!travelClass) throw new NotFoundException('Travel class not found');

    const seat = this.seats.create({
      seatNumber: dto.seatNumber,
      isActive: dto.isActive ?? true,
      plane,
      travelClass,
    });
    return this.seats.save(seat);
  }

  async updateSeat(companyId: string, planeId: string, seatId: string, dto: UpdateSeatDto) {
    const seat = await this.findSeatById(companyId, planeId, seatId);

    if (dto.seatNumber !== undefined) {
      seat.seatNumber = dto.seatNumber;
    }
    if (dto.isActive !== undefined) {
      seat.isActive = dto.isActive;
    }
    if (dto.travelClassId) {
      const travelClass = await this.travelClasses.findOne({ where: { id: dto.travelClassId } });
      if (!travelClass) throw new NotFoundException('Travel class not found');
      seat.travelClass = travelClass;
    }

    return this.seats.save(seat);
  }

  async removeSeat(companyId: string, planeId: string, seatId: string) {
    const seat = await this.findSeatById(companyId, planeId, seatId);
    await this.seats.remove(seat);
    return { id: seatId };
  }

  listAllPlanes(page = 1, limit = 50) {
    return this.planes.findAndCount({
      order: { model: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { company: true },
    });
  }

  async getPlane(id: string) {
    const plane = await this.planes.findOne({ where: { id }, relations: { company: true, seats: true } });
    if (!plane) throw new NotFoundException('Plane not found');
    return plane;
  }

  createPlaneGlobal(dto: CreatePlaneWithCompanyDto) {
    return this.createPlane(dto.companyId, dto);
  }

  async updatePlaneGlobal(id: string, dto: UpdatePlaneDto) {
    const plane = await this.getPlane(id);
    Object.assign(plane, dto);
    return this.planes.save(plane);
  }

  async removePlaneGlobal(id: string) {
    const plane = await this.getPlane(id);
    await this.planes.remove(plane);
    return { id };
  }

  async listSeatsGlobal(page = 1, limit = 100, planeId?: string) {
    return this.seats.findAndCount({
      where: planeId ? { plane: { id: planeId } } : undefined,
      order: { seatNumber: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { plane: { company: true }, travelClass: true },
    });
  }

  async getSeat(id: string) {
    const seat = await this.seats.findOne({ where: { id }, relations: { plane: { company: true }, travelClass: true } });
    if (!seat) throw new NotFoundException('Seat not found');
    return seat;
  }

  async createSeatGlobal(dto: CreateSeatWithPlaneDto) {
    const plane = await this.getPlane(dto.planeId);
    const travelClass = await this.travelClasses.findOne({ where: { id: dto.travelClassId } });
    if (!travelClass) throw new NotFoundException('Travel class not found');
    const seat = this.seats.create({
      seatNumber: dto.seatNumber,
      isActive: dto.isActive ?? true,
      plane,
      travelClass,
    });
    return this.seats.save(seat);
  }

  async updateSeatGlobal(id: string, dto: UpdateSeatWithPlaneDto) {
    const seat = await this.getSeat(id);
    if (dto.seatNumber !== undefined) seat.seatNumber = dto.seatNumber;
    if (dto.isActive !== undefined) seat.isActive = dto.isActive;
    if (dto.travelClassId) {
      const travelClass = await this.travelClasses.findOne({ where: { id: dto.travelClassId } });
      if (!travelClass) throw new NotFoundException('Travel class not found');
      seat.travelClass = travelClass;
    }
    if (dto.planeId) {
      seat.plane = await this.getPlane(dto.planeId);
    }
    return this.seats.save(seat);
  }

  async removeSeatGlobal(id: string) {
    const seat = await this.getSeat(id);
    await this.seats.remove(seat);
    return { id };
  }
}
