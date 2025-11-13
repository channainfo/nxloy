import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { VerificationModule } from '../verification/verification.module';
import { MfaModule } from '../mfa/mfa.module';
import { RbacModule } from '../rbac/rbac.module';
import { SecurityModule } from '../security/security.module';
import { QueueModule } from '../queue/queue.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { requireEnvInt } from '../common/utils/env.util';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: requireEnvInt('RATE_LIMIT_TTL') * 1000,
        limit: requireEnvInt('RATE_LIMIT_MAX'),
      },
    ]),
    QueueModule,
    AuditModule,
    SecurityModule,
    EmailModule,
    AuthModule,
    VerificationModule,
    MfaModule,
    RbacModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
