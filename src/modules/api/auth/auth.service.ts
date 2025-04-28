import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/modules/shared/email/email.service';
import { normalizePermissions } from 'src/utils/normalizePermissions';

import { User } from '../users/entity/user';
import { PaymentService } from '../payment/payment.service';

import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private paymentService: PaymentService,
    private emailService: EmailService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async loginSteam(user: User) {
    const normalizedPermissions = normalizePermissions(user);

    const hasActiveSubscription =
      await this.paymentService.getActiveSubscription(user.id);

    const payload = {
      sub: user.id,
      role: user.role.name,
      avatar: user.avatar,
      profile: user.profile,
      name: user.name,
      hasActiveSubscription: !!hasActiveSubscription,
      permissions: normalizedPermissions,
    };

    return this.refreshTokenService.generateTokenPair(user, payload);
  }

  async forgotPassword(email: string): Promise<number> {
    // Generate a random 6 digits code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Implementation for sending password reset email
    await this.emailService.sendEmail({
      subject: 'Reset Password',
      to: email,
      text: `Click on this link to reset your password: ${code}`,
    });

    return code;
  }
}
