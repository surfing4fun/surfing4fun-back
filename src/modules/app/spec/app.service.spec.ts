import { AppService } from '../app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('getHello() should return "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
