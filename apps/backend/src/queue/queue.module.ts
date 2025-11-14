import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { EmailProcessor } from './processors/email.processor';
import { QueueName } from './interfaces/queue.interface';
import { requireEnv, requireEnvInt, optionalEnv } from '../common/utils/env.util';

/**
 * Queue Module
 * Manages background job processing
 *
 * Uses Bull (Redis-based queue) for:
 * - Async email sending
 * - Scheduled jobs
 * - Retry logic
 * - Job prioritization
 *
 * Requires Redis:
 * REDIS_URL=redis://localhost:6379
 */
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: requireEnv('REDIS_HOST'),
        port: requireEnvInt('REDIS_PORT'),
        password: optionalEnv('REDIS_PASSWORD'), // Optional: undefined if not set
      },
    }),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
    }),
  ],
  providers: [QueueService, EmailProcessor],
  exports: [QueueService],
})
export class QueueModule {}
