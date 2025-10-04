import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { UpdateSeatDto } from './update-seat.dto';

export class UpdateSeatWithPlaneDto extends UpdateSeatDto {
  @ApiPropertyOptional({ format: 'uuid', example: 'b20c83bc-6f48-4766-9d4e-6f8d2dfc45b2' })
  @IsOptional()
  @IsUUID()
  planeId?: string;
}
