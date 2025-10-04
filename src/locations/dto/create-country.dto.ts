import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Kingdom of Saudi Arabia' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ minLength: 2, maxLength: 3, example: 'SA' })
  @IsString()
  @Length(2, 3)
  code!: string;
}
