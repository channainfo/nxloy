import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Email Module
 * Provides email sending functionality across the application
 *
 * Features:
 * - Nodemailer SMTP integration
 * - Handlebars template engine
 * - Pre-built email templates
 * - Template caching for performance
 *
 * Templates available:
 * - email-verification
 * - pin-verification
 * - password-reset
 * - welcome
 * - two-factor-code
 * - password-changed
 *
 * Usage in other modules:
 * @Injectable()
 * export class SomeService {
 *   constructor(private emailService: EmailService) {}
 *
 *   async sendWelcomeEmail(user: User) {
 *     await this.emailService.sendEmail({
 *       to: user.email,
 *       subject: 'Welcome to NxLoy!',
 *       template: EmailTemplate.WELCOME,
 *       context: { firstName: user.firstName }
 *     });
 *   }
 * }
 */
@Global() // Makes EmailService available everywhere
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
