import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { BhopPrismaService } from '../../../shared/prisma/bhop.service';

@Module({
  imports: [HelpersModule],
  providers: [UsersService, BhopPrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
