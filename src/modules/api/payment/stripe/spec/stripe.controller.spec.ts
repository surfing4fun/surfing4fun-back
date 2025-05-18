import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/modules/api/core/users/users.service';

import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { StripeWebhooksService } from '../stripe-webhooks.service';
import { StripeController } from '../stripe.controller';
import { StripeService } from '../stripe.service';

describe('StripeController', () => {
  let controller: StripeController;
  const mock = {
    stripeService: {
      getCustomer: jest.fn(),
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      createBillingPortalSession: jest.fn(),
      listActiveProductsWithPrices: jest.fn(),
      validateWebhook: jest.fn(),
    },
    usersService: { findOne: jest.fn() },
    webhooksService: {
      handleCheckoutSessionCompleted: jest.fn(),
      handleInvoicePaid: jest.fn(),
      handleChargeRefunded: jest.fn(),
      handleSubscriptionDeleted: jest.fn(),
      handleAsyncPaymentSucceeded: jest.fn(),
      handleAsyncPaymentFailed: jest.fn(),
    },
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        { provide: StripeService, useValue: mock.stripeService },
        { provide: UsersService, useValue: mock.usersService },
        { provide: StripeWebhooksService, useValue: mock.webhooksService },
      ],
    }).compile();
    controller = mod.get(StripeController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createCustomerSession', () => {
    const dto: CreateCheckoutSessionDto = {
      items: [{ priceId: 'p', quantity: 1 }],
      mode: 'payment',
    };

    it('throws NotFound if user not found', async () => {
      mock.stripeService.getCustomer.mockResolvedValue(null);
      mock.usersService.findOne.mockResolvedValue(null);
      await expect(controller.createCustomerSession('u', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('creates session when customer exists', async () => {
      const cust = { id: 'c' };
      mock.stripeService.getCustomer.mockResolvedValue(cust);
      mock.stripeService.createCheckoutSession.mockResolvedValue({
        id: 's',
      } as any);
      const res = await controller.createCustomerSession('u', dto);
      expect(res).toEqual({ id: 's' });
    });
  });

  describe('createBillingPortal', () => {
    it('throws if user not found', async () => {
      mock.stripeService.getCustomer.mockRejectedValue(new Error());
      mock.usersService.findOne.mockResolvedValue(null);
      await expect(controller.createBillingPortal('u')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns url on success', async () => {
      const bp = { url: 'x' };
      mock.stripeService.getCustomer.mockRejectedValue(new Error());
      mock.usersService.findOne.mockResolvedValue({ id: 'u' } as any);
      mock.stripeService.createCustomer.mockResolvedValue({ id: 'c' } as any);
      mock.stripeService.createBillingPortalSession.mockResolvedValue(
        bp as any,
      );
      const res = await controller.createBillingPortal('u');
      expect(res).toEqual({ url: 'x' });
    });
  });

  describe('listProducts', () => {
    it('returns active products', async () => {
      const stub = [{ id: 'p1' }];
      mock.stripeService.listActiveProductsWithPrices.mockResolvedValue(stub);
      expect(await controller.listProducts()).toEqual(stub);
    });
  });

  describe('handleWebhook', () => {
    const raw = Buffer.from('x');
    const req = { rawBody: raw } as RawBodyRequest<Request>;

    it('throws Unauthorized on invalid event', async () => {
      mock.stripeService.validateWebhook.mockResolvedValue(false);
      await expect(controller.handleWebhook(req, 'sig')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('dispatches to webhooksService on known type', async () => {
      const evt = { type: 'checkout.session.completed' } as any;
      mock.stripeService.validateWebhook.mockResolvedValue(evt);
      await controller.handleWebhook(req, 'sig');
      expect(
        mock.webhooksService.handleCheckoutSessionCompleted,
      ).toHaveBeenCalledWith(evt);
    });
  });
});
