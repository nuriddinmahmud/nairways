import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, IsNumberString } from 'class-validator';
import { FlightStatus } from '../../common/constants';

export class CreateFlightDto {
  @ApiProperty({ example: 'AW-204' })
  @IsString()
  flightNumber!: string;

  @ApiProperty({ example: '0d9f7f6b-8d81-4f3b-9a9a-4d7c3210d111' })
  @IsString()
  companyId!: string;

  @ApiProperty({ example: '5cfa2a8e-33bb-4f39-9f6e-66b54fbc65a1' })
  @IsString()
  departureAirportId!: string;

  @ApiProperty({ example: 'a3d9bf9c-81fb-4e67-9f2b-8d64aaf5e331' })
  @IsString()
  arrivalAirportId!: string;

  @ApiProperty({ example: 'b20c83bc-6f48-4766-9d4e-6f8d2dfc45b2' })
  @IsString()
  planeId!: string;

  @ApiProperty({ example: '2025-10-12T08:30:00.000Z' })
  @IsDateString()
  departureTime!: string;

  @ApiProperty({ example: '2025-10-12T12:15:00.000Z' })
  @IsDateString()
  arrivalTime!: string;

  @ApiProperty({ enum: FlightStatus, example: FlightStatus.SCHEDULED })
  @IsEnum(FlightStatus)
  status: FlightStatus = FlightStatus.SCHEDULED;

  @ApiProperty({ example: '250.00' })
  @IsNumberString()
  basePrice!: string;
}
