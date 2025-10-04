import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Seat } from './seat.entity';
import { Flight } from '../../flights/entities/flight.entity';

@Entity('planes')
export class Plane {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 140 })
  model!: string;

  @Column({ type: 'int' })
  totalSeats!: number;

  @ManyToOne(() => Company, (c) => c.planes, { onDelete: 'CASCADE' })
  company!: Company;

  @OneToMany(() => Seat, (s) => s.plane, { cascade: true })
  seats!: Seat[];

  @OneToMany(() => Flight, (f) => f.plane)
  flights!: Flight[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
