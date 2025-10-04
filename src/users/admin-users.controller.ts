import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/admins')
export class AdminUsersController {
  constructor(private service: UsersService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  createAdmin(@Body() dto: CreateUserDto) {
    dto.role = UserRole.ADMIN;
    return this.service.create(dto);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  listAdmins() {
    return this.service.listAdmins();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  getAdmin(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/promote')
  promote(@Param('id') id: string) {
    return this.service.promoteToAdmin(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id/demote')
  demote(@Param('id') id: string) {
    return this.service.demoteToUser(id);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
