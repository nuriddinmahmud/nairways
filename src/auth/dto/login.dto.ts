import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nuriddinmahmud@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'NuriddinZNZ' })
  @IsString()
  password!: string;
}
