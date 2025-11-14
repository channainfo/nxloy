import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getQueueToken } from '@nestjs/bull';
import { QueueName } from './interfaces/queue.interface';
import { Queue } from 'bull';

describe('QueueService', () => {
  let service: QueueService;
  let mockEmailQueue: Partial<Queue>;

  beforeEach(async () => {
    mockEmailQueue = {
      add: jest.fn().mockResolvedValue({}),
      getJobCounts: jest.fn().mockResolvedValue({
        active: 5,
        completed: 100,
        failed: 2,
        delayed: 3,
        waiting: 10,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken(QueueName.EMAIL),
          useValue: mockEmailQueue,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueEmail', () => {
    it('should queue email with default priority', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'verification-code' as const,
        context: { code: '123456' },
      };

      await service.queueEmail(emailData);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(emailData, {
        priority: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    });

    it('should queue email with custom priority', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Urgent Email',
        template: 'verification-code' as const,
        context: { code: '123456' },
      };

      await service.queueEmail(emailData, 10);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        emailData,
        expect.objectContaining({
          priority: 10,
        }),
      );
    });

    it('should configure retry with exponential backoff', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        template: 'verification-code' as const,
        context: {},
      };

      await service.queueEmail(emailData);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        emailData,
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }),
      );
    });

    it('should remove completed jobs but keep failed jobs', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test',
        template: 'verification-code' as const,
        context: {},
      };

      await service.queueEmail(emailData);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        emailData,
        expect.objectContaining({
          removeOnComplete: true,
          removeOnFail: false,
        }),
      );
    });
  });

  describe('scheduleEmail', () => {
    it('should schedule email with delay', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Scheduled Email',
        template: 'verification-code' as const,
        context: { code: '123456' },
      };
      const delay = 60000; // 1 minute

      await service.scheduleEmail(emailData, delay);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(emailData, {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    });

    it('should handle scheduling with zero delay', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Immediate Email',
        template: 'verification-code' as const,
        context: {},
      };

      await service.scheduleEmail(emailData, 0);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        emailData,
        expect.objectContaining({
          delay: 0,
        }),
      );
    });

    it('should schedule email with large delay', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Future Email',
        template: 'verification-code' as const,
        context: {},
      };
      const delay = 86400000; // 24 hours

      await service.scheduleEmail(emailData, delay);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        emailData,
        expect.objectContaining({
          delay: 86400000,
        }),
      );
    });
  });

  describe('getEmailQueueStats', () => {
    it('should return queue statistics', async () => {
      const stats = await service.getEmailQueueStats();

      expect(stats).toEqual({
        queue: QueueName.EMAIL,
        active: 5,
        completed: 100,
        failed: 2,
        delayed: 3,
        waiting: 10,
      });
      expect(mockEmailQueue.getJobCounts).toHaveBeenCalled();
    });

    it('should handle empty queue', async () => {
      mockEmailQueue.getJobCounts = jest.fn().mockResolvedValue({
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        waiting: 0,
      });

      const stats = await service.getEmailQueueStats();

      expect(stats).toEqual({
        queue: QueueName.EMAIL,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        waiting: 0,
      });
    });
  });
});
