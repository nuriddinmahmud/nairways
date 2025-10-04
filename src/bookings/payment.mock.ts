export class PaymentMock {
  static async charge(amount: number, meta?: Record<string, any>) {
    await new Promise((r) => setTimeout(r, 200));
    if (Math.random() < 0.02) {
      return { success: false, reason: 'Card declined' };
    }
    return { success: true, txnId: 'MOCK-' + Math.random().toString(36).slice(2) };
  }
}
