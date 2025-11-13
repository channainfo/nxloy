import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueName, EmailJobData } from './interfaces/queue.interface';

/**
 * Queue Service
 * Manages background job queues
 *
 * Queues:
 * - Email - Email sending (with retry)
 * - Notifications - Push notifications
 * - Analytics - Analytics processing
 *
 * Features:
 * - Job retry with exponential backoff
 * - Job prioritization
 * - Job scheduling (delayed jobs)
 * - Job progress tracking
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueName.EMAIL) private emailQueue: Queue,
  ) {}

  /**
   * Queue email job
   * Sends email asynchronously in background
   *
   * @param data Email job data
   * @param priority Job priority (1-10, higher = more important)
   */
  async queueEmail(data: EmailJobData, priority = 5): Promise<void> {
    await this.emailQueue.add(data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, 4s, 8s
      },
      removeOnComplete: true,
      removeOnFail: false, // Keep failed jobs for debugging
    });

    this.logger.log(`Email queued: ${data.to}`);
  }

  /**
   * Schedule email job
   * Sends email at specific time
   *
   * @param data Email job data
   * @param delay Delay in milliseconds
   */
  async scheduleEmail(data: EmailJobData, delay: number): Promise<void> {
    await this.emailQueue.add(data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.logger.log(`Email scheduled for ${new Date(Date.now() + delay)}`);
  }

  /**
   * Get queue stats
   */
  async getEmailQueueStats() {
    const counts = await this.emailQueue.getJobCounts();
    return {
      queue: QueueName.EMAIL,
      ...counts,
    };
  }
}
