import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateSeatDto {
  @ApiProperty({ example: '12A' })
  @IsString()
  @MaxLength(6)
  seatNumber!: string;

  @ApiProperty({ format: 'uuid', example: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6' })
  @IsUUID()
  travelClassId!: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
