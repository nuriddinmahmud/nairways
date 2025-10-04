import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ format: 'uuid', example: 'f71ce0fe-42e4-4df7-84a2-885c0c1746d3' })
  @IsUUID()
  bookingId!: string;
}
