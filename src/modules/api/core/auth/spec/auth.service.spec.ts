import { EmailService } from 'src/modules/shared/email/email.service';
import { normalizePermissions } from 'src/utils/normalizePermissions';

import { PaymentService } from '../../../payment/payment.service';
import { AuthService } from '../auth.service';
import { RefreshTokenService } from '../refresh-token.service';

jest.mock('src/utils/normalizePermissions');

describe('AuthService', () => {
  let service: AuthService;
  let paymentService: Partial<PaymentService>;
  let emailService: Partial<EmailService>;
  let refreshTokenService: Partial<RefreshTokenService>;

  beforeEach(() => {
    paymentService = { getActiveSubscription: jest.fn() };
    emailService = { sendEmail: jest.fn() };
    refreshTokenService = { generateTokenPair: jest.fn() };
    service = new AuthService(
      paymentService as PaymentService,
      emailService as EmailService,
      refreshTokenService as RefreshTokenService,
    );
  });

  describe('loginSteam', () => {
    it('should call paymentService and generateTokenPair with correct payload', async () => {
      // 1) normalizePermissions must be mocked
      (normalizePermissions as jest.Mock).mockReturnValue(['permA', 'permB']);
      // 2) paymentService mock
      (paymentService.getActiveSubscription as jest.Mock).mockResolvedValueOnce(
        null,
      );
      // 3) refreshTokenService mock
      (
        refreshTokenService.generateTokenPair as jest.Mock
      ).mockResolvedValueOnce({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const user: any = {
        id: 'u1',
        role: { name: 'User' },
        avatar: 'a.png',
        profile: '/me',
        name: 'Bob',
      };

      const tokens = await service.loginSteam(user);

      expect(paymentService.getActiveSubscription).toHaveBeenCalledWith('u1');
      expect(refreshTokenService.generateTokenPair).toHaveBeenCalledWith(
        user,
        expect.objectContaining({
          sub: 'u1',
          role: 'User',
          avatar: 'a.png',
          profile: '/me',
          name: 'Bob',
          hasActiveSubscription: false,
          permissions: ['permA', 'permB'],
        }),
      );
      expect(tokens).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0.123456));
    afterEach(() => jest.restoreAllMocks());

    it('should generate a 6-digit code and send email', async () => {
      const code = await service.forgotPassword('x@y.com');
      expect(code).toBeGreaterThanOrEqual(100000);
      expect(code).toBeLessThan(1000000);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'x@y.com',
          subject: expect.stringContaining('Reset Password'),
          text: expect.stringContaining(code.toString()),
        }),
      );
    });
  });
});
