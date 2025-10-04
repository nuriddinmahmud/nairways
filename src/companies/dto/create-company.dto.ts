import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'BlueSky Airlines' })
  @IsString()
  @MaxLength(140)
  name!: string;

  @ApiPropertyOptional({ example: 'Regional airline focused on Central Asia routes.' })
  @IsOptional()
  @IsString()
  description?: string;
}
