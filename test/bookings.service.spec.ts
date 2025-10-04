import { BookingsService } from '../src/bookings/bookings.service';

describe('BookingsService (unit)', () => {
  it('calcPrice returns a positive number', async () => {
    const proto: any = (BookingsService as any).prototype;
    expect(proto.calcPrice(100, 1.0)).toBeGreaterThan(0);
  });
});
