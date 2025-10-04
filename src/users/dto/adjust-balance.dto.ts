import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({
    description: 'Miqdor (musbat son – balansga qo‘shish, manfiy son – balansdan ayirish)',
    example: 150.5,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  amount!: number;

  @ApiProperty({
    required: false,
    example: 'Sodiqlik bonusi uchun qo‘lda balansga qo‘shildi',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
