import { Module } from '@nestjs/common';
import { EventsModule } from 'src/modules/shared/events/events.module';

import { StripeWebhooksService } from './stripe-webhooks.service';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

import { AuthModule } from '../../core/auth/auth.module';
import { UsersService } from '../../core/users/users.service';
import { PaymentService } from '../payment.service';

@Module({
  providers: [
    StripeService,
    StripeWebhooksService,
    PaymentService,
    UsersService,
  ],
  controllers: [StripeController],
  imports: [EventsModule, AuthModule],
})
export class StripeModule {}
