import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TravelClassName } from '../../common/constants';

export class SearchFlightsDto {
  @ApiProperty({ example: 'TAS' })
  @IsString()
  from!: string;

  @ApiProperty({ example: 'LHR' })
  @IsString()
  to!: string;

  @ApiProperty({ example: '2025-10-12' })
  @IsDateString()
  date!: string;

  @ApiProperty({ required: false, example: '2025-10-20' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiProperty({ enum: TravelClassName, required: false, example: TravelClassName.BUSINESS })
  @IsOptional()
  @IsEnum(TravelClassName)
  class?: TravelClassName;

  @ApiProperty({ default: 1, example: 2 })
  @IsInt()
  @Min(1)
  passengers = 1;

  @ApiProperty({ required: false, example: 800 })
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  directOnly?: boolean;
}
