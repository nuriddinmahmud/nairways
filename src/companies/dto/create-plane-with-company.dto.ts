import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CreatePlaneDto } from './create-plane.dto';

export class CreatePlaneWithCompanyDto extends CreatePlaneDto {
  @ApiProperty({ format: 'uuid', example: '0d9f7f6b-8d81-4f3b-9a9a-4d7c3210d111' })
  @IsUUID()
  companyId!: string;
}
