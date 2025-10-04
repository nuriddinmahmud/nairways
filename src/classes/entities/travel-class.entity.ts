import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TravelClassName } from '../../common/constants';

@Entity('travel_classes')
@Index(['name'], { unique: true })
export class TravelClass {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TravelClassName })
  name!: TravelClassName;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  multiplier!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
