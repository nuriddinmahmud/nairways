import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.service.findById(req.user.sub);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.service.updateProfile(req.user.sub, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/balance')
  adjustBalance(@Param('id') id: string, @Body() dto: AdjustBalanceDto) {
    return this.service.adjustBalance(id, dto.amount);
  }

  @Delete('me')
  removeMe(@Req() req: any) {
    return this.service.delete(req.user.sub);
  }
}
