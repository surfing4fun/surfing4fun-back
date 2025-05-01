import { Module } from '@nestjs/common';
import { EventsModule } from 'src/modules/shared/events/events.module';

import { PaymentService } from '../payment.service';
import { UsersService } from '../../core/users/users.service';
import { AuthModule } from '../../core/auth/auth.module';

import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeWebhooksService } from './stripe-webhooks.service';

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
