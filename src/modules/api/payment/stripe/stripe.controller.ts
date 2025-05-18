/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeWebhooksService } from './stripe-webhooks.service';
import { StripeService } from './stripe.service';

import { UsersService } from '../../core/users/users.service';

@Public()
@ApiTags('stripe')
@Controller('payments/stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private usersService: UsersService,
    private stripeWebhooksService: StripeWebhooksService,
  ) {}

  @Post('customers/:customer_id/checkoutSession')
  async createCustomerSession(
    @Param('customer_id') customerId: string,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    // Check if customer exists
    let customer = await this.stripeService.getCustomer(customerId).catch();

    if (!customer) {
      const user = await this.usersService.findOne(customerId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const {
        roleId,
        steamId,
        created_at,
        updated_at,
        avatar,
        profile,
        role,
        ...filteredUser
      } = user;

      customer = await this.stripeService.createCustomer(filteredUser);
    }

    const lineItems = createCheckoutSessionDto.items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    // Create a Checkout Session
    return this.stripeService.createCheckoutSession({
      customer: customer.id,
      payment_method_types: ['card', 'boleto'],
      billing_address_collection: 'required',
      line_items: lineItems,
      mode: createCheckoutSessionDto.mode,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });
  }

  @Post('customers/:customer_id/billing-portal')
  async createBillingPortal(@Param('customer_id') customerId: string) {
    let customer = await this.stripeService
      .getCustomer(customerId)
      .catch(() => null);
    if (!customer) {
      const user = await this.usersService.findOne(customerId);
      if (!user) throw new NotFoundException('User not found');

      const {
        roleId,
        steamId,
        created_at,
        updated_at,
        avatar,
        profile,
        role,
        ...rest
      } = user;
      customer = await this.stripeService.createCustomer(rest);
    }

    const session = await this.stripeService.createBillingPortalSession({
      customer: customer.id,
      return_url: process.env.STRIPE_BILLING_PORTAL_RETURN_URL,
    });

    return { url: session.url };
  }

  @Get('products')
  async listProducts() {
    return this.stripeService.listActiveProductsWithPrices();
  }

  @Post('webhooks')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.stripeService.validateWebhook(
      req.rawBody,
      signature,
    );

    if (!event) {
      throw new UnauthorizedException('Invalid webhook');
    }

    // Handle the webhook event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.stripeWebhooksService.handleCheckoutSessionCompleted(event);
        break;
      case 'invoice.paid':
        await this.stripeWebhooksService.handleInvoicePaid(event);
        break;
      case 'charge.refunded':
        await this.stripeWebhooksService.handleChargeRefunded(event);
        break;
      case 'customer.subscription.deleted':
        await this.stripeWebhooksService.handleSubscriptionDeleted(event);
        break;
      case 'checkout.session.async_payment_succeeded':
        await this.stripeWebhooksService.handleAsyncPaymentSucceeded(event);
        break;
      case 'checkout.session.async_payment_failed':
        await this.stripeWebhooksService.handleAsyncPaymentFailed(event);
        break;
    }
  }
}
