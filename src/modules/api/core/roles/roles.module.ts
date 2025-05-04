import { Module } from '@nestjs/common';
import { EventsModule } from 'src/modules/shared/events/events.module';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

import { PaymentService } from '../../payment/payment.service';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PaymentService, UsersService],
  exports: [RolesService],
  imports: [EventsModule, AuthModule],
})
export class RolesModule {}
