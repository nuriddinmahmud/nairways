import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoyaltyService } from './loyalty.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { isUUID } from 'class-validator';
import { CreateLoyaltyTransactionDto } from './dto/create-loyalty-transaction.dto';
import { UpdateLoyaltyTransactionDto } from './dto/update-loyalty-transaction.dto';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private service: LoyaltyService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.service.get(req.user.sub);
  }

  @Post('redeem')
  redeem(@Req() req: any, @Body('points') points: number) {
    return this.service.redeemPoints(req.user.sub, points);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  list(@Query('page') page = 1, @Query('limit') limit = 50, @Query('userId') userId?: string) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    if (!Number.isInteger(pageNum) || pageNum < 1) throw new BadRequestException('page must be a positive integer');
    if (!Number.isInteger(limitNum) || limitNum < 1) throw new BadRequestException('limit must be a positive integer');
    if (userId && !isUUID(userId)) throw new BadRequestException('userId must be a valid UUID');
    return this.service.list(pageNum, limitNum, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('transactions/:id')
  getTransaction(@Param('id') id: string) {
    return this.service.getTransaction(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('transactions')
  createTransaction(@Body() dto: CreateLoyaltyTransactionDto) {
    return this.service.createManual(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('transactions/:id')
  updateTransaction(@Param('id') id: string, @Body() dto: UpdateLoyaltyTransactionDto) {
    return this.service.updateTransaction(id, dto.reason);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('transactions/:id')
  removeTransaction(@Param('id') id: string) {
    return this.service.removeTransaction(id);
  }
}
