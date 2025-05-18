import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from 'src/modules/api/core/auth/refresh-token.service';
import { UsersService } from 'src/modules/api/core/users/users.service';
import { EventsGateway } from 'src/modules/shared/events/events.gateway';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

import { PaymentService } from '../../payment.service';
import { StripeWebhooksService } from '../stripe-webhooks.service';
import { StripeService } from '../stripe.service';

describe('StripeWebhooksService', () => {
  let service: StripeWebhooksService;
  const mock = {
    usersService: { findOne: jest.fn() },
    stripeService: {
      getSubscription: jest.fn(),
      getCheckoutSession: jest.fn(),
      getInvoice: jest.fn(),
    },
    paymentService: { getActiveSubscription: jest.fn() },
    prismaService: {
      subscriptions: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    },
    refreshTokenService: { generateAccessToken: jest.fn() },
    eventsGateway: { io: { sockets: { sockets: [] } } },
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        StripeWebhooksService,
        { provide: UsersService, useValue: mock.usersService },
        { provide: StripeService, useValue: mock.stripeService },
        { provide: PaymentService, useValue: mock.paymentService },
        { provide: DashboardPrismaService, useValue: mock.prismaService },
        { provide: RefreshTokenService, useValue: mock.refreshTokenService },
        { provide: EventsGateway, useValue: mock.eventsGateway },
      ],
    }).compile();
    service = mod.get(StripeWebhooksService);
  });

  afterEach(() => jest.clearAllMocks());

  it('throws on subscription flow when user missing', async () => {
    const evt = {
      data: {
        object: { mode: 'subscription', customer: 'u', subscription: 's' },
      },
    } as any;
    mock.usersService.findOne.mockResolvedValue(null);
    await expect(service.handleCheckoutSessionCompleted(evt)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when subscription not found', async () => {
    mock.usersService.findOne.mockResolvedValue({ id: 'u' });
    mock.stripeService.getSubscription.mockResolvedValue(null);
    const evt = {
      data: {
        object: { mode: 'subscription', customer: 'u', subscription: 's' },
      },
    } as any;
    await expect(service.handleCheckoutSessionCompleted(evt)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('records one-time payment when mode=payment', async () => {
    const spy = jest
      .spyOn<any, any>(service as any, '_recordOneTimePayment')
      .mockResolvedValue(undefined);
    const evt = {
      data: { object: { mode: 'payment', id: 'sess', payment_status: 'paid' } },
    } as any;
    await service.handleCheckoutSessionCompleted(evt);
    expect(spy).toHaveBeenCalledWith(evt.data.object, 'active');
  });

  it('expires payments cron without error', async () => {
    mock.prismaService.subscriptions.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.handleExpiredPayments()).resolves.toBeUndefined();
  });
});
