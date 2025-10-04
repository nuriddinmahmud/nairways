import { BadRequestException, Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.ensureSuperAdmin();
    } catch (error: any) {
      this.logger.error('Failed to ensure default super admin', error?.stack || error);
    }
  }

  async findById(id: string) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
      withDeleted: true,
    });
    if (existing) {
      throw new BadRequestException('User with provided email or username already exists');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, password });
    return this.repo.save(user);
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async adjustBalance(id: string, amount: number) {
    const user = await this.findById(id);
    const current = Number(user.balance ?? 0);
    const next = Math.round((current + amount) * 100) / 100;
    if (next < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }
    user.balance = next;
    return this.repo.save(user);
  }

  async listAdmins() {
    return this.repo.find({
      where: [{ role: UserRole.ADMIN }, { role: UserRole.SUPER_ADMIN }],
    });
  }

  async promoteToAdmin(id: string) {
    const user = await this.findById(id);
    user.role = UserRole.ADMIN;
    return this.repo.save(user);
  }

  async demoteToUser(id: string) {
    const user = await this.findById(id);
    user.role = UserRole.USER;
    return this.repo.save(user);
  }

  async delete(id: string) {
    await this.repo.softDelete(id);
    return { id };
  }

  private async ensureSuperAdmin() {
    const username = this.config.get<string>('superAdmin.username');
    const password = this.config.get<string>('superAdmin.password');
    if (!username || !password) {
      return;
    }
    const email = this.config.get<string>('superAdmin.email') || `${username}@airways.local`;

    const existing = await this.repo.findOne({ where: [{ username }, { email }] });
    let created = false;
    if (existing) {
      let updated = false;
      if (existing.role !== UserRole.SUPER_ADMIN) {
        existing.role = UserRole.SUPER_ADMIN;
        updated = true;
        this.logger.log(`Promoted existing user '${username}' to SUPER_ADMIN.`);
      }

      const passwordMatches = await bcrypt
        .compare(password, existing.password)
        .catch(() => false);
      if (!passwordMatches) {
        existing.password = await bcrypt.hash(password, 10);
        updated = true;
        this.logger.log(`Super admin password reset for '${username}'.`);
      }

      if (updated) {
        await this.repo.save(existing);
      }
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const superAdmin = this.repo.create({
        username,
        email,
        password: hashed,
        role: UserRole.SUPER_ADMIN,
        fullName: 'System Super Admin',
      });

      await this.repo.save(superAdmin);
      created = true;
      this.logger.log(`Default super admin '${username}' created.`);
      console.log('Super admin created successfully');
    }

    console.log(`[SuperAdmin Credentials] email: ${email} password: ${password}`);
  }
}
