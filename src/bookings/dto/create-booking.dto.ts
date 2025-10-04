import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TravelClassName } from '../../common/constants';

export class CreateBookingDto {
  @ApiProperty({ example: 'ab21b5b9-4f80-4b8d-a3fe-cf9e5e3a9f77' })
  @IsUUID()
  flightId!: string;

  @ApiProperty({ description: 'Seat id. Optional if seatNumber provided', example: '91e687b5-4e7d-4fb8-94c1-6ae44f14c8a3', required: false })
  @IsOptional()
  @IsUUID()
  seatId?: string;

  @ApiProperty({ required: false, example: '12A' })
  @IsOptional()
  @IsString()
  seatNumber?: string;

  @ApiProperty({ enum: TravelClassName, example: TravelClassName.BUSINESS })
  @IsEnum(TravelClassName)
  class!: TravelClassName;

  @ApiProperty({ default: false, example: false })
  @IsBoolean()
  isRoundTrip = false;

  @ApiProperty({ required: false, example: 'd14a1a9b-7a5d-4eb4-8b6c-0f3bcb9d2b64' })
  @IsOptional()
  @IsUUID()
  returnFlightId?: string;

  @ApiProperty({ required: false, example: '302dc99f-b5f3-4e17-9353-2a2b573b62cd' })
  @IsOptional()
  @IsUUID()
  returnSeatId?: string;

  @ApiProperty({ required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  redeemPoints?: number;
}
