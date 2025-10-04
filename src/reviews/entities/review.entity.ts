import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Flight } from '../../flights/entities/flight.entity';

@Entity('reviews')
@Index(['flight', 'user'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.reviews, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Flight, (f) => f.reviews, { onDelete: 'CASCADE' })
  flight!: Flight;

  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
