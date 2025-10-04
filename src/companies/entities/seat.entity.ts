import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plane } from './plane.entity';
import { TravelClass } from '../../classes/entities/travel-class.entity';

@Entity('seats')
@Index(['plane', 'seatNumber'], { unique: true })
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 6 })
  seatNumber!: string;

  @ManyToOne(() => TravelClass, { eager: true, onDelete: 'RESTRICT' })
  travelClass!: TravelClass;

  @ManyToOne(() => Plane, (p) => p.seats, { onDelete: 'CASCADE' })
  plane!: Plane;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
