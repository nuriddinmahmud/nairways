import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../common/constants';

export class UpdateBookingAdminDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 277.99 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ type: Object, example: { base: 150, taxes: 0.12 } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRoundTrip?: boolean;
}
