import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BhopModule } from '../api/bhop/bhop.module';
import { AuthModule } from '../api/core/auth/auth.module';
import { PermissionRolesModule } from '../api/core/permission-roles/permission-roles.module';
import { PermissionsModule } from '../api/core/permissions/permissions.module';
import { RolesModule } from '../api/core/roles/roles.module';
import { UsersModule } from '../api/core/users/users.module';
import { HealthModule } from '../api/health/health.module';
import { KsfScraperModule } from '../api/ksf-scrapper/ksf-scraper.module';
import { PaymentModule } from '../api/payment/payment.module';
import { StripeModule } from '../api/payment/stripe/stripe.module';
import { ServerHealthModule } from '../api/server-health/server-health.module';
import { SurfModule } from '../api/surf/surf.module';
import { HelpersModule } from '../helpers/helpers.module';
import { EventsModule } from '../shared/events/events.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { SseModule } from '../shared/sse/sse.module';
@Module({
  imports: [
    PrismaModule,
    SseModule,
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PermissionRolesModule,
    PaymentModule,
    StripeModule,
    EventsModule,
    KsfScraperModule,
    ServerHealthModule,
    SurfModule,
    BhopModule,
    HelpersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
