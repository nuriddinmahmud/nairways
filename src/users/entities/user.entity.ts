import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, LoyaltyTier } from '../../common/constants';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { News } from '../../news/entities/news.entity';
import { LoyaltyTransaction } from '../../loyalty/entities/loyalty-transaction.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 80 })
  username!: string;

  @Column({ length: 120 })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'int', default: 0 })
  loyaltyPoints!: number;

  @Column({ type: 'enum', enum: LoyaltyTier, default: LoyaltyTier.BRONZE })
  tier!: LoyaltyTier;

  @OneToMany(() => Booking, (b) => b.user)
  bookings!: Booking[];

  @OneToMany(() => Review, (r) => r.user)
  reviews!: Review[];

  @OneToMany(() => News, (n) => n.author)
  news!: News[];

  @OneToMany(() => LoyaltyTransaction, (t) => t.user)
  loyaltyTransactions!: LoyaltyTransaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
