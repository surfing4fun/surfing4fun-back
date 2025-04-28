import { Module } from '@nestjs/common';
import { EventsModule } from 'src/modules/shared/events/events.module';

import { UsersService } from '../../users/users.service';
import { PaymentService } from '../payment.service';
import { AuthModule } from '../../auth/auth.module';

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
