import { Injectable } from '@nestjs/common';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

@Injectable()
export class PaymentService {
  constructor(private prismaService: DashboardPrismaService) {}

  getActiveSubscription(userId: string) {
    if (!userId) return null;

    return this.prismaService.subscriptions.findFirst({
      where: {
        AND: [
          {
            userId,
          },
          {
            status: 'active',
          },
        ],
      },
    });
  }
}
