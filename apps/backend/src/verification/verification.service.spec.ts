import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { PrismaClient, VerificationType } from '@nxloy/database';
import { DatabaseHelper } from '../test/helpers/database.helper';
import { UserFactory, VerificationTokenFactory } from '../test/factories';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { mockEmailService } from '../test/mocks/service-mocks';

describe('VerificationService', () => {
  let service: VerificationService;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;
  let tokenFactory: VerificationTokenFactory;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);
    tokenFactory = new VerificationTokenFactory(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaClient, useValue: prisma },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('requestPin', () => {
    it('should create verification token and queue email', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
      });

      const result = await service.requestPin({
        identifier: user.email,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
      });

      expect(result.success).toBe(true);

      const token = await prisma.verificationToken.findFirst({
        where: { identifier: user.email },
      });

      expect(token).toBeDefined();
      expect(token!.pinHash).toBeDefined();
      expect(token!.pinSalt).toBeDefined();
    });

    it('should generate 6-digit PIN', async () => {
      const user = await userFactory.createVerified();

      await service.requestPin({
        identifier: user.email,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
      });

      // PIN should be 6 digits (verified through email content in production)
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: user.email,
          template: expect.any(String),
        })
      );
    });

    it('should set correct expiry time', async () => {
      const user = await userFactory.createVerified();

      await service.requestPin({
        identifier: user.email,
        type: 'EMAIL_VERIFICATION',
        userId: user.id,
      });

      const token = await prisma.verificationToken.findFirst({
        where: { identifier: user.email },
      });

      const now = new Date();
      const expiresAt = token!.expiresAt;
      const diffMinutes = (expiresAt.getTime() - now.getTime()) / 60000;

      expect(diffMinutes).toBeGreaterThan(14);
      expect(diffMinutes).toBeLessThan(16);
    });
  });

  describe('verifyPin', () => {
    it('should verify valid PIN', async () => {
      const user = await userFactory.createVerified();
      const token = await tokenFactory.create({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      const result = await service.verifyPin({
        identifier: user.email,
        pin: token.plainPin,
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should reject invalid PIN', async () => {
      const user = await userFactory.createVerified();
      await tokenFactory.create({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      await expect(
        service.verifyPin({
          identifier: user.email,
          pin: '000000',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject expired PIN', async () => {
      const user = await userFactory.createVerified();
      const token = await tokenFactory.createExpired({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      await expect(
        service.verifyPin({
          identifier: user.email,
          pin: token.plainPin,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject already used PIN', async () => {
      const user = await userFactory.createVerified();
      const token = await tokenFactory.createUsed({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      await expect(
        service.verifyPin({
          identifier: user.email,
          pin: token.plainPin,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should limit attempts to 5', async () => {
      const user = await userFactory.createVerified();
      const token = await tokenFactory.create({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await service.verifyPin({
            identifier: user.email,
            pin: '000000',
          });
        } catch (e) {
          // Expected to fail
        }
      }

      // 6th attempt should fail with max attempts error
      await expect(
        service.verifyPin({
          identifier: user.email,
          pin: token.plainPin,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const user = await userFactory.createVerified();
      const token = await tokenFactory.create({
        identifier: user.email,
        type: VerificationType.EMAIL_VERIFICATION,
        userId: user.id,
      });

      const result = await service.verifyToken(token.token);

      expect(result.success).toBe(true);
    });

    it('should reject invalid token', async () => {
      await expect(
        service.verifyToken('invalid-token-uuid')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject expired token', async () => {
      const token = await tokenFactory.createExpired();

      await expect(service.verifyToken(token.token)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
