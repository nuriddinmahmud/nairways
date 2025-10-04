import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Flight } from '../../flights/entities/flight.entity';
import { Seat } from '../../companies/entities/seat.entity';
import { PaymentStatus } from '../../common/constants';
import { TravelClass } from '../../classes/entities/travel-class.entity';

@Entity('bookings')
@Index('uniq_active_seat_flight', ['flight', 'seat'], {
  unique: true,
  where: `"paymentStatus" IN ('PENDING','PAID')`,
})
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.bookings, { onDelete: 'CASCADE', eager: true })
  user!: User;

  @ManyToOne(() => Flight, (f) => f.bookings, { onDelete: 'CASCADE', eager: true })
  flight!: Flight;

  @ManyToOne(() => Seat, { onDelete: 'RESTRICT', eager: true })
  seat!: Seat;

  @ManyToOne(() => TravelClass, { eager: true })
  travelClass!: TravelClass;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ default: false })
  isRoundTrip!: boolean;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'linkedBookingId' })
  linkedBooking?: Booking;

  @Column({ type: 'uuid', nullable: true })
  linkedBookingId?: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
