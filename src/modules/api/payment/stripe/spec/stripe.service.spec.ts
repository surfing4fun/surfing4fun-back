import { StripeService } from '../stripe.service';

describe('StripeService', () => {
  let service: StripeService;
  let fakeApi: any;

  beforeEach(() => {
    // 1) Create a plain object with jest.fn() methods
    fakeApi = {
      customers: {
        retrieve: jest.fn(),
        create: jest.fn(),
      },
      subscriptions: {
        retrieve: jest.fn(),
      },
      checkout: {
        sessions: {
          retrieve: jest.fn(),
          create: jest.fn(),
        },
      },
      invoices: {
        retrieve: jest.fn(),
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
      prices: {
        list: jest.fn(),
      },
    };

    service = new StripeService();
    // @ts-ignore override private api instance
    service['api'] = fakeApi;
  });

  it('getCustomer returns null on error', async () => {
    fakeApi.customers.retrieve.mockRejectedValue(new Error('fail'));
    await expect(service.getCustomer('x')).resolves.toBeNull();
  });

  it('getSubscription returns null on error', async () => {
    fakeApi.subscriptions.retrieve.mockRejectedValue(new Error('fail'));
    await expect(service.getSubscription('s')).resolves.toBeNull();
  });

  it('getCheckoutSession expands line_items', async () => {
    const session = { id: 'sess', line_items: { data: [] } };
    fakeApi.checkout.sessions.retrieve.mockResolvedValue(session);
    await expect(service.getCheckoutSession('sess')).resolves.toBe(session);
  });

  it('getInvoice returns null on error', async () => {
    fakeApi.invoices.retrieve.mockRejectedValue(new Error('fail'));
    await expect(service.getInvoice('i')).resolves.toBeNull();
  });

  it('createBillingPortalSession calls API', async () => {
    const stub = { id: 'bp' };
    fakeApi.billingPortal.sessions.create.mockResolvedValue(stub);
    await expect(
      service.createBillingPortalSession({ customer: 'c', return_url: 'u' }),
    ).resolves.toBe(stub);
    expect(fakeApi.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'c',
      return_url: 'u',
    });
  });

  it('createCustomer calls API', async () => {
    const stub = { id: 'c1' };
    fakeApi.customers.create.mockResolvedValue(stub);
    await expect(service.createCustomer({ name: 'n' })).resolves.toBe(stub);
    expect(fakeApi.customers.create).toHaveBeenCalledWith({ name: 'n' });
  });

  it('createCheckoutSession calls API', async () => {
    const opts = { mode: 'payment' };
    const stub = { id: 'cs' };
    fakeApi.checkout.sessions.create.mockResolvedValue(stub);
    await expect(service.createCheckoutSession(opts as any)).resolves.toBe(
      stub,
    );
    expect(fakeApi.checkout.sessions.create).toHaveBeenCalledWith(opts);
  });

  it('validateWebhook returns false on error', async () => {
    fakeApi.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('bad');
    });
    await expect(service.validateWebhook('p', 'sig')).resolves.toBe(false);
  });

  it('listActiveProductsWithPrices groups correctly', async () => {
    const product = {
      id: 'p1',
      active: true,
      name: 'N',
      description: 'D',
      images: ['i'],
    };
    const price1 = {
      id: 'pr1',
      unit_amount: 100,
      currency: 'usd',
      recurring: null,
      product,
    };
    const price2 = {
      id: 'pr2',
      unit_amount: 200,
      currency: 'usd',
      recurring: null,
      product,
    };
    fakeApi.prices.list.mockResolvedValue({ data: [price1, price2] });

    const res = await service.listActiveProductsWithPrices();
    expect(res).toEqual([
      {
        id: 'p1',
        name: 'N',
        description: 'D',
        images: ['i'],
        prices: [
          { id: 'pr1', unit_amount: 100, currency: 'usd', recurring: null },
          { id: 'pr2', unit_amount: 200, currency: 'usd', recurring: null },
        ],
      },
    ]);
    expect(fakeApi.prices.list).toHaveBeenCalledWith({
      active: true,
      expand: ['data.product'],
    });
  });
});
