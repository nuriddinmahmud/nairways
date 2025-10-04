import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLoyaltyTransactionDto {
  @ApiPropertyOptional({ example: 'Adjusted after manual review' })
  @IsOptional()
  @IsString()
  reason?: string;
}
