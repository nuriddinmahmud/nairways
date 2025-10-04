import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Flight } from '../../flights/entities/flight.entity';

@Entity('airports')
@Index(['code'], { unique: true })
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 140 })
  name!: string;

  @Column({ length: 10 })
  code!: string;

  @ManyToOne(() => City, (c) => c.airports, { onDelete: 'CASCADE' })
  city!: City;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @OneToMany(() => Flight, (f) => f.departureAirport)
  departures!: Flight[];

  @OneToMany(() => Flight, (f) => f.arrivalAirport)
  arrivals!: Flight[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
