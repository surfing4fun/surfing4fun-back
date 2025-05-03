import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthModule } from '../api/health/health.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { SseModule } from '../shared/sse/sse.module';
import { PaymentModule } from '../api/payment/payment.module';
import { EventsModule } from '../shared/events/events.module';
import { StripeModule } from '../api/payment/stripe/stripe.module';
import { KsfScraperModule } from '../api/ksf-scrapper/ksf-scraper.module';
import { ServerHealthModule } from '../api/server-health/server-health.module';
import { AuthModule } from '../api/core/auth/auth.module';
import { UsersModule } from '../api/core/users/users.module';
import { RolesModule } from '../api/core/roles/roles.module';
import { PermissionsModule } from '../api/core/permissions/permissions.module';
import { PermissionRolesModule } from '../api/core/permission-roles/permission-roles.module';
import { MaptiersModule } from '../api/maptiers/maptiers.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    MaptiersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
