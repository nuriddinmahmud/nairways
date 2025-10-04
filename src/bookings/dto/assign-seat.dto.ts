import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignSeatDto {
  @ApiProperty({ format: 'uuid', example: '91e687b5-4e7d-4fb8-94c1-6ae44f14c8a3' })
  @IsUUID()
  seatId!: string;
}
