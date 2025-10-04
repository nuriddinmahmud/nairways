import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('news')
@Index(['publishedAt'])
@Index(['slug'], { unique: true })
export class News {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column({ length: 220 })
  slug!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User, (u) => u.news, { onDelete: 'SET NULL', eager: true })
  author!: User;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @Column({ nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
