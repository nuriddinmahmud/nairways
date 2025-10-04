import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { FlightsModule } from '../flights/flights.module';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [FlightsModule, NewsModule],
  controllers: [AdminController],
})
export class AdminModule {}
