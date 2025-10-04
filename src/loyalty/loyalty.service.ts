import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoyaltyTransaction, LoyaltyTxnType } from './entities/loyalty-transaction.entity';
import { Repository, EntityManager, FindManyOptions } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoyaltyTier } from '../common/constants';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyTransaction)
    private repo: Repository<LoyaltyTransaction>,
    @InjectRepository(User)
    private users: Repository<User>,
  ) {}

  async list(page = 1, limit = 50, userId?: string) {
    const options: FindManyOptions<LoyaltyTransaction> = {
      order: { createdAt: 'DESC' },
      relations: { user: true },
      skip: (page - 1) * limit,
      take: limit,
    };
    if (userId) {
      options.where = { user: { id: userId } as any };
    }
    const [items, total] = await this.repo.findAndCount(options);
    return { total, page, limit, items };
  }

  async earnPoints(userId: string, points: number, reason: string, manager?: EntityManager) {
    const em = manager ?? this.repo.manager;
    await em.save(LoyaltyTransaction, { user: { id: userId } as any, points, type: 'EARN', reason });
    const user = await em.findOneByOrFail(User, { id: userId });
    user.loyaltyPoints += points;
    user.tier = this.computeTier(user.loyaltyPoints);
    await em.save(User, user);
  }

  async redeemPoints(userId: string, points: number, manager?: EntityManager, reason = 'Redeem') {
    const em = manager ?? this.repo.manager;
    const user = await em.findOneByOrFail(User, { id: userId });
    user.loyaltyPoints = Math.max(0, user.loyaltyPoints - points);
    user.tier = this.computeTier(user.loyaltyPoints);
    await em.save(User, user);
    await em.save(LoyaltyTransaction, { user: { id: userId } as any, points: -points, type: 'REDEEM', reason });
  }

  async get(userId: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    const txns = await this.repo.find({ where: { user: { id: userId } as any }, order: { createdAt: 'DESC' }, take: 50 });
    return { points: user.loyaltyPoints, tier: user.tier, history: txns };
  }

  async getTransaction(id: string) {
    const txn = await this.repo.findOne({ where: { id }, relations: { user: true } });
    if (!txn) throw new NotFoundException('Transaction not found');
    return txn;
  }

  async createManual(dto: { userId: string; type: LoyaltyTxnType; points: number; reason?: string }) {
    if (dto.points <= 0) throw new BadRequestException('points must be positive');
    if (dto.type === 'EARN') {
      await this.earnPoints(dto.userId, dto.points, dto.reason ?? 'Manual earn');
    } else {
      await this.redeemPoints(dto.userId, dto.points, undefined, dto.reason ?? 'Manual redeem');
    }
    return this.repo.findOne({
      where: { user: { id: dto.userId } as any },
      order: { createdAt: 'DESC' },
    });
  }

  async updateTransaction(id: string, reason?: string) {
    const txn = await this.getTransaction(id);
    txn.reason = reason;
    return this.repo.save(txn);
  }

  async removeTransaction(id: string) {
    const txn = await this.getTransaction(id);
    const user = await this.users.findOneByOrFail({ id: txn.user.id });
    const absolutePoints = Math.abs(txn.points);
    if (txn.type === 'EARN') {
      user.loyaltyPoints = Math.max(0, user.loyaltyPoints - absolutePoints);
    } else {
      user.loyaltyPoints += absolutePoints;
    }
    user.tier = this.computeTier(user.loyaltyPoints);
    await this.repo.manager.transaction(async (manager) => {
      await manager.save(User, user);
      await manager.remove(LoyaltyTransaction, txn);
    });
    return { id };
  }

  computeTier(points: number): LoyaltyTier {
    if (points >= 2000) return LoyaltyTier.GOLD;
    if (points >= 1000) return LoyaltyTier.SILVER;
    return LoyaltyTier.BRONZE;
  }
}
