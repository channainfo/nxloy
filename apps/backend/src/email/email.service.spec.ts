import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('EmailService', () => {
  let service: EmailService;
  const originalEnv = process.env;

  beforeAll(() => {
    // Mock environment variables
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      SMTP_USER: 'test@test.com',
      SMTP_PASSWORD: 'testpassword',
      SMTP_FROM_EMAIL: 'noreply@nxloy.com',
      SMTP_FROM_NAME: 'NxLoy',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should load SMTP configuration from env vars', () => {
      expect(service).toBeDefined();
      expect(service['smtpHost']).toBe('smtp.test.com');
      expect(service['smtpPort']).toBe(587);
      expect(service['smtpSecure']).toBe(false);
    });

    it('should throw if required env vars missing', () => {
      const { SMTP_HOST, ...envWithoutHost } = process.env;
      process.env = envWithoutHost;

      expect(() => {
        new EmailService();
      }).toThrow();

      process.env = originalEnv;
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      // Create test template
      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      // Ensure templates directory exists
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }

      // Create test template
      const templateContent = '<h1>Welcome {{name}}</h1><p>Code: {{code}}</p>';
      fs.writeFileSync(templatePath, templateContent);

      // Mock transporter
      const mockSendMail = jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
      });
      service['transporter'].sendMail = mockSendMail;

      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'verification-code',
        context: { name: 'John', code: '123456' },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockSendMail).toHaveBeenCalled();

      // Cleanup
      fs.unlinkSync(templatePath);
    });

    it('should handle email sending failure', async () => {
      const mockSendMail = jest.fn().mockRejectedValue(new Error('SMTP error'));
      service['transporter'].sendMail = mockSendMail;

      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
      fs.writeFileSync(templatePath, '<h1>Test</h1>');

      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        template: 'verification-code',
        context: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');

      fs.unlinkSync(templatePath);
    });

    it('should use custom from address if provided', async () => {
      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
      fs.writeFileSync(templatePath, '<h1>Test</h1>');

      const mockSendMail = jest.fn().mockResolvedValue({
        messageId: 'test-id',
      });
      service['transporter'].sendMail = mockSendMail;

      await service.sendEmail({
        from: 'custom@example.com',
        to: 'test@example.com',
        subject: 'Test',
        template: 'verification-code',
        context: {},
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'custom@example.com',
        }),
      );

      fs.unlinkSync(templatePath);
    });

    it('should include cc, bcc, and attachments', async () => {
      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
      fs.writeFileSync(templatePath, '<h1>Test</h1>');

      const mockSendMail = jest.fn().mockResolvedValue({
        messageId: 'test-id',
      });
      service['transporter'].sendMail = mockSendMail;

      const attachments = [{ filename: 'test.txt', content: 'test' }];

      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        template: 'verification-code',
        context: {},
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
        attachments,
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          cc: 'cc@example.com',
          bcc: 'bcc@example.com',
          attachments,
        }),
      );

      fs.unlinkSync(templatePath);
    });
  });

  describe('renderTemplate', () => {
    it('should render template with context', async () => {
      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
      fs.writeFileSync(templatePath, '<h1>Hello {{name}}</h1>');

      const result = await service['renderTemplate']('verification-code', {
        name: 'John',
      });

      expect(result).toBe('<h1>Hello John</h1>');

      fs.unlinkSync(templatePath);
    });
  });

  describe('getTemplate', () => {
    it('should cache templates', async () => {
      const templatesDir = path.join(__dirname, 'templates');
      const templatePath = path.join(templatesDir, 'verification-code.hbs');

      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }
      fs.writeFileSync(templatePath, '<h1>Test</h1>');

      // First call - loads from file
      const template1 = await service['getTemplate']('verification-code');

      // Second call - should use cache
      const template2 = await service['getTemplate']('verification-code');

      expect(template1).toBe(template2);
      expect(service['templateCache'].has('verification-code')).toBe(true);

      fs.unlinkSync(templatePath);
    });
  });

  describe('verifyConnection', () => {
    it('should verify SMTP connection successfully', async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      service['transporter'].verify = mockVerify;

      const result = await service.verifyConnection();

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      const mockVerify = jest.fn().mockRejectedValue(new Error('Connection failed'));
      service['transporter'].verify = mockVerify;

      const result = await service.verifyConnection();

      expect(result).toBe(false);
    });
  });

  describe('getDefaultFrom', () => {
    it('should return formatted from address', () => {
      const from = service['getDefaultFrom']();
      expect(from).toContain('<');
      expect(from).toContain('>');
      expect(from).toContain('@');
    });
  });

  describe('getTemplatePath', () => {
    it('should return correct template path', () => {
      const templatePath = service['getTemplatePath']('verification-code');
      expect(templatePath).toContain('verification-code.hbs');
      expect(templatePath).toContain('templates');
    });
  });
});
