import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { PaymentStatus } from '../common/constants';
import * as crypto from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(Booking) private readonly bookingsRepo: Repository<Booking>,
  ) {}

  async create(userId: string, bookingId: string) {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId }, relations: { user: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.id !== userId) throw new ForbiddenException('Cannot issue ticket for another user');
    if (booking.paymentStatus !== PaymentStatus.PAID)
      throw new BadRequestException('Only paid bookings can generate tickets');

    const existing = await this.ticketsRepo.findOne({ where: { booking: { id: bookingId } as any } });
    if (existing) return existing;

    const ticket = this.ticketsRepo.create({
      booking,
      user: booking.user,
      code: await this.generateCode(),
    });
    return this.ticketsRepo.save(ticket);
  }

  async listMine(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.ticketsRepo.findAndCount({
      where: { user: { id: userId } as any },
      order: { issuedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async listAll(page = 1, limit = 50) {
    const [items, total] = await this.ticketsRepo.findAndCount({
      order: { issuedAt: 'DESC' },
      relations: { user: true, booking: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { total, page, limit, items };
  }

  async findById(id: string) {
    const ticket = await this.ticketsRepo.findOne({
      where: { id },
      relations: { user: true, booking: true },
      withDeleted: true,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.ticketsRepo.delete(id);
    return { id };
  }

  private async generateCode() {
    for (let i = 0; i < 5; i += 1) {
      const code = `TKT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
      const exists = await this.ticketsRepo.exists({ where: { code } });
      if (!exists) return code;
    }
    throw new BadRequestException('Unable to generate ticket code');
  }
}
