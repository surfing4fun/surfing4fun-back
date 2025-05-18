import { Module } from '@nestjs/common';
import { HelpersModule } from 'src/modules/helpers/helpers.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';

@Module({
  imports: [HelpersModule],
  providers: [UsersService, SurfPrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
