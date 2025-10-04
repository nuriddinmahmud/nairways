import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('tickets')
@Index(['booking'], { unique: true })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user!: User;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE', eager: true })
  booking!: Booking;

  @Column({ length: 32, unique: true })
  code!: string;

  @CreateDateColumn()
  issuedAt!: Date;
}
