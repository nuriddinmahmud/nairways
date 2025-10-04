import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';

@Entity('countries')
@Index(['code'], { unique: true })
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 80 })
  name!: string;

  @Column({ length: 3 })
  code!: string;

  @OneToMany(() => City, (c) => c.country)
  cities!: City[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
