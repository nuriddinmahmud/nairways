import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto.email, dto.password);
  }

  @Post('admin/register')
  registerAdmin(@Body() dto: AdminRegisterDto) {
    return this.service.registerAdmin(dto);
  }

  @Post('admin/login')
  loginAdmin(@Body() dto: LoginDto) {
    return this.service.loginAdmin(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.service.logout(req.user.sub);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    const payload = JSON.parse(
      Buffer.from(dto.refreshToken.split('.')[1], 'base64').toString(),
    );
    return this.service.refresh(payload.sub, payload.jti);
  }
}
