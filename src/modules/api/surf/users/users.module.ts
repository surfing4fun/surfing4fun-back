import { Module } from '@nestjs/common';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, SurfPrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
