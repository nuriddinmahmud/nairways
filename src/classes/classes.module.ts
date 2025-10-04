import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelClass } from './entities/travel-class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TravelClass])],
  providers: [ClassesService],
  controllers: [ClassesController],
  exports: [ClassesService, TypeOrmModule],
})
export class ClassesModule {}
