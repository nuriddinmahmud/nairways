import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TravelClass } from './entities/travel-class.entity';
import { Repository } from 'typeorm';
import { TravelClassName } from '../common/constants';
import { CreateTravelClassDto } from './dto/create-travel-class.dto';
import { UpdateTravelClassDto } from './dto/update-travel-class.dto';

@Injectable()
export class ClassesService {
  constructor(@InjectRepository(TravelClass) private repo: Repository<TravelClass>) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const klass = await this.repo.findOne({ where: { id } });
    if (!klass) throw new NotFoundException('Travel class not found');
    return klass;
  }

  async create(dto: CreateTravelClassDto) {
    const klass = this.repo.create(dto);
    return this.repo.save(klass);
  }

  async update(id: string, dto: UpdateTravelClassDto) {
    const klass = await this.repo.preload({ id, ...dto });
    if (!klass) throw new NotFoundException('Travel class not found');
    return this.repo.save(klass);
  }

  async remove(id: string) {
    const klass = await this.findOne(id);
    await this.repo.remove(klass);
    return { id };
  }

  ensureDefaults() {
    const defs = [
      { name: TravelClassName.ECONOM, multiplier: 1.0 },
      { name: TravelClassName.BUSINESS, multiplier: 1.5 },
      { name: TravelClassName.VIP, multiplier: 2.0 },
    ];
    return Promise.all(
      defs.map(async (d) => {
        const existing = await this.repo.findOne({ where: { name: d.name } });
        if (!existing) await this.repo.save(d);
      }),
    );
  }
}
