import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Jeddah' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ format: 'uuid', example: 'a7c2b8e9-4f1d-42aa-bb12-5c9e6e7a1d92' })
  @IsUUID()
  countryId!: string;
}
