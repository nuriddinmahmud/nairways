import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Foydalanuvchining to‘liq ismi',
    maxLength: 120,
    example: 'Nuriddin Mahmud',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Foydalanuvchining telefon raqami',
    maxLength: 15,
    example: '+998900002727',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;
}
