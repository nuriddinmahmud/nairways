import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { TravelClassName } from '../../common/constants';

export class CreateTravelClassDto {
  @ApiProperty({ enum: TravelClassName, example: TravelClassName.BUSINESS })
  @IsEnum(TravelClassName)
  name!: TravelClassName;

  @ApiProperty({ minimum: 0.1, default: 1.0, example: 1.5 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0.1)
  multiplier!: number;

  @ApiProperty({ minimum: 0, example: 150 })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  basePrice!: number;
}
