import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../../email/email.service';
import { EmailJobData, JobResult, QueueName } from '../interfaces/queue.interface';

/**
 * Email Queue Processor
 * Processes email jobs in background
 *
 * Jobs are retried 3 times with exponential backoff
 */
@Processor(QueueName.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Process email job
   */
  @Process()
  async handleEmail(job: Job<EmailJobData>): Promise<JobResult> {
    this.logger.log(`Processing email job ${job.id}`);

    try {
      const result = await this.emailService.sendEmail({
        to: job.data.to,
        subject: job.data.subject,
        template: job.data.template as any,
        context: job.data.context,
      });

      if (result.success) {
        this.logger.log(`Email sent successfully: ${job.id}`);
        return { success: true, data: { messageId: result.messageId } };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.logger.error(`Email job failed: ${job.id}`, error);
      throw error; // Retry job
    }
  }
}
