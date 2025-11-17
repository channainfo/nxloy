import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { EmailService } from '../../email/email.service';
import { Job } from 'bull';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handleEmail', () => {
    it('should process email job successfully', async () => {
      const mockJob: Partial<Job> = {
        id: '123',
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          template: 'verification-code',
          context: { code: '123456' },
        },
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      });

      const result = await processor.handleEmail(mockJob as Job);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ messageId: 'msg-123' });
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'verification-code',
        context: { code: '123456' },
      });
    });

    it('should throw error if email send fails', async () => {
      const mockJob: Partial<Job> = {
        id: '123',
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          template: 'verification-code',
          context: {},
        },
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
        success: false,
        error: 'SMTP connection failed',
      });

      await expect(processor.handleEmail(mockJob as Job)).rejects.toThrow(
        'SMTP connection failed',
      );
    });

    it('should throw error if emailService throws', async () => {
      const mockJob: Partial<Job> = {
        id: '123',
        data: {
          to: 'test@example.com',
          subject: 'Test Email',
          template: 'verification-code',
          context: {},
        },
      };

      jest
        .spyOn(emailService, 'sendEmail')
        .mockRejectedValue(new Error('Network error'));

      await expect(processor.handleEmail(mockJob as Job)).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle different email templates', async () => {
      const templates = [
        'verification-code',
        'password-reset',
        'welcome',
        'mfa-code',
      ];

      for (const template of templates) {
        const mockJob: Partial<Job> = {
          id: `job-${template}`,
          data: {
            to: 'test@example.com',
            subject: `Test ${template}`,
            template,
            context: {},
          },
        };

        jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
          success: true,
          messageId: `msg-${template}`,
        });

        const result = await processor.handleEmail(mockJob as Job);

        expect(result.success).toBe(true);
        expect(emailService.sendEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            template,
          }),
        );
      }
    });

    it('should handle email with complex context', async () => {
      const mockJob: Partial<Job> = {
        id: '123',
        data: {
          to: 'test@example.com',
          subject: 'Welcome',
          template: 'welcome',
          context: {
            name: 'John Doe',
            companyName: 'Test Corp',
            dashboardUrl: 'https://app.test.com',
            supportEmail: 'support@test.com',
          },
        },
      };

      jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'msg-welcome',
      });

      const result = await processor.handleEmail(mockJob as Job);

      expect(result.success).toBe(true);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            name: 'John Doe',
            companyName: 'Test Corp',
          }),
        }),
      );
    });
  });
});
