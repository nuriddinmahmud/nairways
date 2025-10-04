import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePlaneDto {
  @ApiProperty({ example: 'Airbus A320neo' })
  @IsString()
  @MaxLength(140)
  model!: string;

  @ApiProperty({ minimum: 1, example: 186 })
  @IsInt()
  @IsPositive()
  totalSeats!: number;
}
