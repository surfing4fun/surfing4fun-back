import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsGateway } from 'src/modules/shared/events/events.gateway';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';
import { normalizePermissions } from 'src/utils/normalizePermissions';
import Stripe from 'stripe';

import { StripeService } from './stripe.service';
import { RefreshTokenService } from '../../core/auth/refresh-token.service';
import { UsersService } from '../../core/users/users.service';
import { PaymentService } from '../payment.service';

@Injectable()
export class StripeWebhooksService {
  private readonly logger = new Logger(StripeWebhooksService.name);

  constructor(
    private usersService: UsersService,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    private prismaService: DashboardPrismaService,
    private refreshTokenService: RefreshTokenService,
    private eventsGateway: EventsGateway,
  ) {}

  // Called when the checkout session is completed
  async handleCheckoutSessionCompleted(
    event: Stripe.CheckoutSessionCompletedEvent,
  ) {
    const session = event.data.object;
    const mode = session.mode; // "subscription" or "payment"

    // 1️⃣ Handle one-time payments via the shared helper
    if (mode === 'payment') {
      const paid = session.payment_status === 'paid';
      await this._recordOneTimePayment(
        session,
        paid
          ? 'active' // card/PIX immediately active
          : 'pending', // boleto stays pending until async_payment_succeeded
      );
      return;
    }

    // 2️⃣ Subscription flow in-line
    if (mode === 'subscription') {
      // find the user
      const user = await this.usersService.findOne(String(session.customer));
      if (!user) throw new NotFoundException('User not found');

      // fetch the full subscription (with price.product expanded)
      const subscription = await this.stripeService.getSubscription(
        String(session.subscription),
      );
      if (!subscription) throw new NotFoundException('Subscription not found');

      // extract product IDs
      const productIds = subscription.items.data.map((item) => {
        const prod = item.price.product;
        return typeof prod === 'string' ? prod : prod.id;
      });

      // compute subscription window
      const startDate = new Date(subscription.current_period_start * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);

      // determine your custom “type” (1 or 2) based on env vars
      const whitelistId = process.env.STRIPE_PRODUCT_VIP_WHITELIST;
      const vipId = process.env.STRIPE_PRODUCT_VIP;
      let subscriptionType = '0';
      if (whitelistId && productIds.includes(whitelistId)) {
        subscriptionType = '2';
      } else if (vipId && productIds.includes(vipId)) {
        subscriptionType = '1';
      }

      // persist the subscription record
      await this.prismaService.subscriptions.create({
        data: {
          name: 'Subscription',
          userId: user.id,
          startDate,
          endDate,
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          type: subscriptionType,
        },
      });

      await this._emitSubscriptionUpdate(user.id);
    }
  }

  // Called when the recurring payment is successful
  async handleInvoicePaid(event: Stripe.InvoicePaidEvent) {
    const subscriptionId = event.data.object.subscription;

    // Get the subscription from the database
    const storedSubscription = this.prismaService.subscriptions.findFirst({
      where: {
        stripeSubscriptionId: String(subscriptionId),
      },
    });

    if (!storedSubscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Get more subscription details from the Stripe API
    const subscription = await this.stripeService.getSubscription(
      String(subscriptionId),
    );

    // Update the subscription status
    await this.prismaService.subscriptions.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: 'active',
      },
    });
  }

  // Called when the subscription is deleted or canceled
  async handleSubscriptionDeleted(
    event: Stripe.CustomerSubscriptionDeletedEvent,
  ) {
    const subscriptionId = event.data.object.id;

    // Get the subscription from the database
    const subscription = await this.prismaService.subscriptions.findFirst({
      where: {
        stripeSubscriptionId: String(subscriptionId),
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Update the subscription status
    await this.prismaService.subscriptions.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: 'canceled',
      },
    });
  }

  // Called when the payment is refunded
  async handleChargeRefunded(event: Stripe.ChargeRefundedEvent) {
    if (event.data.object.amount !== event.data.object.amount_refunded) {
      throw new Error('Partial refunds are not supported');
    }

    // Get more details about the invoice
    const invoice = await this.stripeService.getInvoice(
      String(event.data.object.invoice),
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Update the invoice status
    await this.prismaService.subscriptions.update({
      where: {
        id: invoice.id,
      },
      data: {
        status: 'refunded',
      },
    });
  }

  /**
   * Boleto paid: treat exactly like a one-time payment
   */
  async handleAsyncPaymentSucceeded(
    event: Stripe.CheckoutSessionAsyncPaymentSucceededEvent,
  ) {
    const session = event.data.object;
    await this._recordOneTimePayment(session, 'active');
  }

  /**
   * Boleto failed: mark a “Payment” record with `status: 'failed'`
   */
  async handleAsyncPaymentFailed(
    event: Stripe.CheckoutSessionAsyncPaymentFailedEvent,
  ) {
    const session = event.data.object;
    // find an existing DB record by the Checkout Session ID
    const existing = await this.prismaService.subscriptions.findFirst({
      where: { stripeSubscriptionId: session.id },
    });
    if (existing) {
      await this.prismaService.subscriptions.update({
        where: { id: existing.id },
        data: { status: 'failed' },
      });

      await this._emitSubscriptionUpdate(existing.userId);
    } else {
      // if you want to create it even on failure:
      await this._recordOneTimePayment(session, 'failed');
    }
  }

  /**
   * Shared helper for recording a one-time payment (PIX, Boleto, card) as a "Payment" record
   */
  private async _recordOneTimePayment(
    session: Stripe.Checkout.Session,
    status: string,
  ) {
    // 1) fetch full session with line items
    const full = await this.stripeService.getCheckoutSession(session.id);
    const items = full.line_items?.data || [];
    const productIds = items.map((item) => {
      const p = item.price.product;
      return typeof p === 'string' ? p : p.id;
    });

    // 2) find user
    const user = await this.usersService.findOne(String(full.customer));
    if (!user) throw new NotFoundException('User not found');

    // 3) compute dates
    const now = Date.now();
    const startDate = new Date(now);
    const endDate = new Date(now + 30 * 24 * 60 * 60 * 1000);

    // 4) pick subscription type (same logic you already have)
    const whitelistId = process.env.STRIPE_PRODUCT_VIP_WHITELIST;
    const vipId = process.env.STRIPE_PRODUCT_VIP;
    let subscriptionType = '0';
    if (whitelistId && productIds.includes(whitelistId)) {
      subscriptionType = '2';
    } else if (vipId && productIds.includes(vipId)) {
      subscriptionType = '1';
    }

    // 5) persist
    await this.prismaService.subscriptions.create({
      data: {
        name: 'Payment',
        userId: user.id,
        startDate,
        endDate,
        status,
        stripeSubscriptionId: session.id,
        type: subscriptionType,
      },
    });

    await this._emitSubscriptionUpdate(user.id);
  }

  /**
   * Every hour, find all “Payment” subscriptions whose endDate is in the past
   * and whose status isn’t already “expired”, and update them to “expired”.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredPayments() {
    const now = new Date();

    this.logger.log(`Running expired payments cron`);

    const result = await this.prismaService.subscriptions.updateMany({
      where: {
        name: 'Payment',
        endDate: { lt: now },
        status: { not: 'expired' },
      },
      data: { status: 'expired' },
    });

    if (result.count > 0) {
      this.logger.log(
        `Marked ${result.count} one-time payment subscription(s) as expired.`,
      );
    }
  }

  /**
   * Emit a websocket event to the given user with a fresh token
   */
  private async _emitSubscriptionUpdate(userId: string) {
    this.eventsGateway.io.sockets.sockets.forEach(async (client: any) => {
      // Check if the client's id matches
      if (client.user.sub.toLowerCase() === userId) {
        // Get the updated role with permissions from database
        const user = await this.usersService.findOne(userId, {
          withPermissions: true,
        });

        const normalizedPermissions = normalizePermissions(user);

        // Check if there's an active subscription for the current user
        const hasActiveSubscription =
          await this.paymentService.getActiveSubscription(userId);

        const payload = {
          sub: userId,
          permissions: normalizedPermissions,
          role: user.role.name,
          avatar: user.avatar,
          profile: user.profile,
          name: user.name,
          hasActiveSubscription: !!hasActiveSubscription,
        };

        const accessToken =
          await this.refreshTokenService.generateAccessToken(payload);

        client.emit('auth:update', {
          permissions: normalizedPermissions,
          hasActiveSubscription: !!hasActiveSubscription,
          accessToken,
        });
      }
    });
  }
}
