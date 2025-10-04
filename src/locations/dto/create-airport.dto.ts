import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, MaxLength, IsUUID } from 'class-validator';

export class CreateAirportDto {
  @ApiProperty({ example: 'King Abdulaziz International Airport' })
  @IsString()
  @MaxLength(140)
  name!: string;

  @ApiProperty({ minLength: 3, maxLength: 10, example: 'JED' })
  @IsString()
  @Length(3, 10)
  code!: string;

  @ApiProperty({ format: 'uuid', example: 'a3b1c2d3-4e5f-6789-abcd-ef1234567890' })
  @IsUUID()
  cityId!: string;

  @ApiPropertyOptional({ minimum: -90, maximum: 90, example: 21.6700 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  latitude?: number;

  @ApiPropertyOptional({ minimum: -180, maximum: 180, example: 39.1520 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  longitude?: number;
}
