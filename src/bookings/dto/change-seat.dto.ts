import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ChangeSeatDto {
  @ApiProperty({ format: 'uuid', example: '302dc99f-b5f3-4e17-9353-2a2b573b62cd' })
  @IsUUID()
  newSeatId!: string;
}
