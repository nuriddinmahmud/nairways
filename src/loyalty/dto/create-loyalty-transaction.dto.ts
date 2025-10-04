import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { LoyaltyTxnType } from '../entities/loyalty-transaction.entity';

export class CreateLoyaltyTransactionDto {
  @ApiProperty({ format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ['EARN', 'REDEEM'], example: 'EARN' })
  @IsIn(['EARN', 'REDEEM'])
  type!: LoyaltyTxnType;

  @ApiProperty({ example: 250 })
  @IsInt()
  @IsPositive()
  points!: number;

  @ApiProperty({ required: false, example: 'Manual adjustment' })
  @IsOptional()
  @IsString()
  reason?: string;
}
