import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreateSeatDto } from './create-seat.dto';

export class CreateSeatWithPlaneDto extends CreateSeatDto {
  @ApiProperty({ format: 'uuid', example: 'b20c83bc-6f48-4766-9d4e-6f8d2dfc45b2' })
  @IsUUID()
  planeId!: string;
}
