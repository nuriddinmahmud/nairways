import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'Foydalanuvchining yagona login nomi',
    example: 'nuriddinznz',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    description: 'Foydalanuvchining elektron pochta manzili',
    example: 'nuriddinmahmud@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Parol (kamida 8 ta belgidan iborat bo‘lishi kerak)',
    example: 'NuriddinZNZ',
  })
  @MinLength(8)
  password!: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    description: 'Foydalanuvchining roli (masalan: ADMIN yoki USER)',
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    required: false,
    description: 'Foydalanuvchining to‘liq ismi',
    example: 'Nuriddin Mahmud',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    required: false,
    description: 'Foydalanuvchining telefon raqami',
    example: '+998900002727',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
