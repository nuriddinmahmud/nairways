import { Injectable } from '@nestjs/common';

interface Entry { userId: string; jti: string; expAt: number; }

@Injectable()
export class RefreshStoreService {
  private map = new Map<string, Entry>(); // key: `${userId}:${jti}`

  add(userId: string, jti: string, ttlSec: number) {
    const key = `${userId}:${jti}`;
    const expAt = Date.now() + ttlSec * 1000;
    this.map.set(key, { userId, jti, expAt });
    setTimeout(() => this.map.delete(key), ttlSec * 1000).unref?.();
  }

  consume(userId: string, jti: string): boolean {
    const key = `${userId}:${jti}`;
    const e = this.map.get(key);
    if (!e) return false;
    if (e.expAt < Date.now()) {
      this.map.delete(key);
      return false;
    }
    this.map.delete(key);
    return true;
  }
}
