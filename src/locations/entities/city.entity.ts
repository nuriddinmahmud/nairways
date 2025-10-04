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
import { Country } from './country.entity';
import { Airport } from './airport.entity';

@Entity('cities')
@Index(['name', 'country'], { unique: true })
export class City {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @ManyToOne(() => Country, (c) => c.cities, { onDelete: 'CASCADE' })
  country!: Country;

  @OneToMany(() => Airport, (a) => a.city)
  airports!: Airport[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
