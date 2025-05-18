import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService;
  let emitter: EventEmitter2;

  beforeEach(() => {
    appService = new AppService();
    emitter = new EventEmitter2();
    controller = new AppController(appService, emitter);
  });

  describe('getHello', () => {
    it('should return the same value as AppService.getHello()', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Hi Test');
      expect(controller.getHello()).toBe('Hi Test');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('sse', () => {
    it('should emit MessageEvent on "user-fetched"', async () => {
      const stream$ = controller.sse();

      // Emit after a tiny delay so subscription is active
      setTimeout(() => {
        emitter.emit('user-fetched', { id: 42, name: 'Alice' });
      }, 0);

      const msg = await firstValueFrom(stream$.pipe(timeout(100)));

      // MessageEvent has `data` and `type`
      expect(msg).toHaveProperty('data', { id: 42, name: 'Alice' });
      expect(msg).toHaveProperty('type', 'user-fetched');
    });

    it('subscription should time out if no events are emitted', async () => {
      const stream$ = controller.sse();

      // Expect our timeout operator to throw
      await expect(
        firstValueFrom(stream$.pipe(timeout(10))),
      ).rejects.toBeInstanceOf(TimeoutError);
    });
  });
});
