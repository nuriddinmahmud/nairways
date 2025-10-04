import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'nuriddinznz' })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'nuriddinmahmud@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'NuriddinZNZ' })
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, example: 'Nuriddin Mahmud' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false, example: '+998900002727' })
  @IsOptional()
  @IsString()
  phone?: string;
}
