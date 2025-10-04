import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({ description: 'Reason', example: 'Unexpected schedule change' })
  @IsString()
  reason!: string;
}
