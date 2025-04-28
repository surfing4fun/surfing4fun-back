import StripeSDK, { Stripe } from 'stripe';

export class StripeService {
  private readonly secretKey = process.env.STRIPE_SECRET_KEY;
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  private api: StripeSDK;

  constructor() {
    this.api = new StripeSDK(this.secretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async getCustomer(customerId: string) {
    try {
      return await this.api.customers.retrieve(customerId);
    } catch (error) {
      return null;
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      return await this.api.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price.product'],
      });
    } catch (error) {
      return null;
    }
  }

  async getCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    return this.api.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'],
    });
  }

  async getInvoice(invoiceId: string) {
    try {
      return await this.api.invoices.retrieve(invoiceId);
    } catch (error) {
      return null;
    }
  }

  async createBillingPortalSession(params: {
    customer: string;
    return_url: string;
  }): Promise<Stripe.BillingPortal.Session> {
    return this.api.billingPortal.sessions.create(params);
  }

  async createCustomer(customer: StripeSDK.CustomerCreateParams) {
    return this.api.customers.create(customer);
  }

  async createCheckoutSession(options: StripeSDK.Checkout.SessionCreateParams) {
    return this.api.checkout.sessions.create(options);
  }

  async validateWebhook(payload: string | Buffer, signature: string) {
    try {
      return this.api.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Return only active products and their active prices,
   * grouped so each product appears once with its array of prices.
   */
  async listActiveProductsWithPrices(): Promise<
    Array<{
      id: string;
      name: string | null;
      description: string | null;
      images: string[];
      prices: Array<{
        id: string;
        unit_amount: number | null;
        currency: string;
        recurring: Stripe.Price.Recurring | null;
      }>;
    }>
  > {
    // 1️⃣ fetch only active prices, expand the product object
    const { data: prices } = await this.api.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // 2️⃣ filter out archived products
    const activePrices = prices.filter(
      (p) => (p.product as Stripe.Product).active,
    );

    // 3️⃣ group by product.id
    const grouped = activePrices.reduce<
      Record<string, { product: Stripe.Product; prices: Stripe.Price[] }>
    >((acc, price) => {
      const product = price.product as Stripe.Product;
      if (!acc[product.id]) acc[product.id] = { product, prices: [] };
      acc[product.id].prices.push(price);
      return acc;
    }, {});

    // 4️⃣ map into a clean DTO
    return Object.values(grouped).map(({ product, prices }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      prices: prices.map(({ id, unit_amount, currency, recurring }) => ({
        id,
        unit_amount,
        currency,
        recurring,
      })),
    }));
  }
}
