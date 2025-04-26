import { Injectable } from '@nestjs/common';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class PaymentService {
  constructor(private prismaService: DashboardPrismaService) {}

  createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    return this.prismaService.subscriptions.create({
      data: createSubscriptionDto,
    });
  }
}
