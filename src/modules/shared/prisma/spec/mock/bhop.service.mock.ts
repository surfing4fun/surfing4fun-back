import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BhopPrismaService } from 'src/modules/shared/prisma/bhop.service';

export const bhopPrismaServiceMock =
  mockDeep<BhopPrismaService>() as DeepMockProxy<BhopPrismaService>;
