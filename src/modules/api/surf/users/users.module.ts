import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  providers: [UsersService, SurfPrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
