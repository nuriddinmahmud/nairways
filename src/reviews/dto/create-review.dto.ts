import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Max, Min, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'ab21b5b9-4f80-4b8d-a3fe-cf9e5e3a9f77' })
  @IsUUID()
  flightId!: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ required: false, example: 'Professional crew and comfortable seats.' })
  @IsOptional()
  @IsString()
  comment?: string;
}
