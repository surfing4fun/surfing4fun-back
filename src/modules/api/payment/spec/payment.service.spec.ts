import { PaymentService } from '../payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: {
    subscriptions: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaService = {
      subscriptions: {
        findFirst: jest.fn(),
      },
    };
    service = new PaymentService(prismaService as any);
  });

  describe('getActiveSubscription', () => {
    it('returns null immediately if userId is falsy', async () => {
      const result = await service.getActiveSubscription('');
      expect(result).toBeNull();
      expect(prismaService.subscriptions.findFirst).not.toHaveBeenCalled();
    });

    it('calls prismaService.subscriptions.findFirst with correct WHERE filter', async () => {
      const fakeSub = { id: 'sub1', userId: 'u1', status: 'active' };
      prismaService.subscriptions.findFirst.mockResolvedValue(fakeSub);

      const result = await service.getActiveSubscription('u1');

      expect(prismaService.subscriptions.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [{ userId: 'u1' }, { status: 'active' }],
        },
      });
      expect(result).toBe(fakeSub);
    });

    it('propagates errors from prismaService', async () => {
      const error = new Error('DB failure');
      prismaService.subscriptions.findFirst.mockRejectedValue(error);
      await expect(service.getActiveSubscription('u2')).rejects.toBe(error);
    });
  });
});
