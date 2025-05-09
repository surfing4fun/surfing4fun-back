import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { DashboardPrismaService } from 'src/modules/shared/prisma/dashboard.service';

export const dashboardPrismaServiceMock =
  mockDeep<DashboardPrismaService>() as DeepMockProxy<DashboardPrismaService>;
