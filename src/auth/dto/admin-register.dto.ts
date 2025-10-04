import { ApiPropertyOptional } from '@nestjs/swagger';
import { RegisterDto } from './register.dto';
import { IsOptional, IsString } from 'class-validator';

export class AdminRegisterDto extends RegisterDto {
  @ApiPropertyOptional({
    description: 'Optional invite code for admin registration',
    example: 'ADMIN-2024-ACCESS',
  })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}
