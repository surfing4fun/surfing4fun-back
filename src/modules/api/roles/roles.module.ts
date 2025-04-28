import { Module } from '@nestjs/common';
import { EventsModule } from 'src/modules/shared/events/events.module';

import { PaymentService } from '../payment/payment.service';
import { AuthModule } from '../auth/auth.module';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PaymentService],
  exports: [RolesService],
  imports: [EventsModule, AuthModule],
})
export class RolesModule {}
