import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  providers: [UsersService, BhopPrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
