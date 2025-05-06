import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { SurfPrismaService } from 'src/modules/shared/prisma/surf.service';

export const surfPrismaServiceMock =
  mockDeep<SurfPrismaService>() as DeepMockProxy<SurfPrismaService>;
