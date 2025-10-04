import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type LoyaltyTxnType = 'EARN' | 'REDEEM';

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.loyaltyTransactions, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'int' })
  points!: number;

  @Column({ type: 'varchar', length: 12 })
  type!: LoyaltyTxnType;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
