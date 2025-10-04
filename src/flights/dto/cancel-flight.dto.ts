import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelFlightDto {
  @ApiPropertyOptional({
    description: 'Optional reason for cancellation',
    example: 'Nuriddin tomonidan ob-havo yomonligi sababli bekor qilindi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
