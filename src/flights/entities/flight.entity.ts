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
import { Airport } from '../../locations/entities/airport.entity';
import { Plane } from '../../companies/entities/plane.entity';
import { FlightStatus } from '../../common/constants';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('flights')
@Index(['flightNumber'], { unique: true })
@Index(['departureTime'])
@Index(['arrivalTime'])
@Index(['status'])
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 12 })
  flightNumber!: string;

  @ManyToOne(() => Company, (c) => c.flights, { onDelete: 'RESTRICT' })
  company!: Company;

  @ManyToOne(() => Airport, (a) => a.departures, { eager: true, onDelete: 'RESTRICT' })
  departureAirport!: Airport;

  @ManyToOne(() => Airport, (a) => a.arrivals, { eager: true, onDelete: 'RESTRICT' })
  arrivalAirport!: Airport;

  @Column({ type: 'timestamptz' })
  departureTime!: Date;

  @Column({ type: 'timestamptz' })
  arrivalTime!: Date;

  @ManyToOne(() => Plane, (p) => p.flights, { eager: true, onDelete: 'RESTRICT' })
  plane!: Plane;

  @Column({ type: 'enum', enum: FlightStatus, default: FlightStatus.SCHEDULED })
  status!: FlightStatus;

  @Column({ type: 'text', nullable: true })
  cancelReason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice!: number;

  @OneToMany(() => Booking, (b) => b.flight)
  bookings!: Booking[];

  @OneToMany(() => Review, (r) => r.flight)
  reviews!: Review[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
