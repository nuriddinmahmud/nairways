import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RefreshStoreService } from './refresh-store.service';
import { UserRole } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService,
    private cfg: ConfigService,
    private refreshStore: RefreshStoreService,
  ) {}

  async register(dto: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    return this.createUser(dto, UserRole.USER);
  }

  async registerAdmin(dto: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    return this.createUser(dto, UserRole.ADMIN);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.issueTokens(user);
  }

  async loginAdmin(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Admin credentials required');
    }
    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.cfg.get('jwt.accessSecret'),
      expiresIn: this.cfg.get('jwt.accessExpiresIn'),
    });
    const refreshJti = crypto.randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { ...payload, jti: refreshJti },
      {
        secret: this.cfg.get('jwt.refreshSecret'),
        expiresIn: this.cfg.get('jwt.refreshExpiresIn'),
      },
    );
    const ttlSec = this.parseTTL(this.cfg.get<string>('jwt.refreshExpiresIn') ?? '7d');
    this.refreshStore.add(user.id, refreshJti, ttlSec);
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, jti: string) {
    const ok = this.refreshStore.consume(userId, jti);
    if (!ok) throw new UnauthorizedException('Refresh token invalid/expired');
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    return this.issueTokens(user);
  }

  async logout(userId: string, jti?: string) {
    if (jti) this.refreshStore.consume(userId, jti);
    return { ok: true };
  }

  private async createUser(
    dto: {
      username: string;
      email: string;
      password: string;
      fullName?: string;
      phone?: string;
    },
    role: UserRole,
  ) {
    const exists = await this.usersRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
      withDeleted: false,
    });
    if (exists) throw new BadRequestException('User already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, password: hashed, role });
    await this.usersRepo.save(user);
    return this.issueTokens(user);
  }

  private parseTTL(text: string): number {
    const m = text.match(/^(\d+)([smhd])$/);
    if (!m) return 7 * 24 * 3600;
    const n = parseInt(m[1], 10);
    const unit = m[2] as 's'|'m'|'h'|'d';
    const multi = { s: 1, m: 60, h: 3600, d: 86400 }[unit] || 86400;
    return n * multi;
  }
}
