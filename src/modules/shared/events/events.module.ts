import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/modules/api/auth/constants';

import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway],
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  exports: [EventsGateway],
})
export class EventsModule {}
