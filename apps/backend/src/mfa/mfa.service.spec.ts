import { Test, TestingModule } from '@nestjs/testing';
import { MfaService } from './mfa.service';
import { PrismaClient } from '@nxloy/database';
import { DatabaseHelper } from '../test/helpers/database.helper';
import { UserFactory } from '../test/factories';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { EmailService } from '../email/email.service';
import { mockEmailService } from '../test/mocks/service-mocks';

describe('MfaService', () => {
  let service: MfaService;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        { provide: PrismaClient, useValue: prisma },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('setupTotp', () => {
    it('should generate TOTP secret and QR code', async () => {
      const user = await userFactory.createVerified();

      const result = await service.setupTotp(user.id);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.qrCodeUrl).toContain('data:image/png;base64');
    });

    it('should throw BadRequestException if MFA already enabled', async () => {
      const user = await userFactory.createWithMfa();

      await expect(service.setupTotp(user.id)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should store backup codes in database', async () => {
      const user = await userFactory.createVerified();

      await service.setupTotp(user.id);

      const backupCodes = await prisma.backupCode.findMany({
        where: { userId: user.id },
      });

      expect(backupCodes).toHaveLength(10);
    });
  });

  describe('enableTotp', () => {
    it('should enable TOTP with valid code', async () => {
      const user = await userFactory.createVerified();
      const setup = await service.setupTotp(user.id);

      // Generate valid TOTP code
      const token = speakeasy.totp({
        secret: setup.secret,
        encoding: 'base32',
      });

      const result = await service.enableTotp(user.id, token);

      expect(result.success).toBe(true);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser!.mfaEnabled).toBe(true);
    });

    it('should throw UnauthorizedException with invalid code', async () => {
      const user = await userFactory.createVerified();
      await service.setupTotp(user.id);

      await expect(service.enableTotp(user.id, '000000')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('verifyTotp', () => {
    it('should verify valid TOTP code', async () => {
      const user = await userFactory.createVerified();
      const setup = await service.setupTotp(user.id);

      const token = speakeasy.totp({
        secret: setup.secret,
        encoding: 'base32',
      });

      await service.enableTotp(user.id, token);

      const result = await service.verifyTotp(user.id, token);

      expect(result.success).toBe(true);
      expect(result.method).toBe('TOTP');
    });

    it('should reject invalid TOTP code', async () => {
      const user = await userFactory.createWithMfa();

      await expect(service.verifyTotp(user.id, '000000')).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('verifyBackupCode', () => {
    it('should verify valid backup code once', async () => {
      const user = await userFactory.createVerified();
      const setup = await service.setupTotp(user.id);
      const backupCode = setup.backupCodes[0];

      const result = await service.verifyBackupCode(user.id, backupCode);

      expect(result.success).toBe(true);
      expect(result.method).toBe('BACKUP_CODE');

      // Try to use the same code again
      await expect(
        service.verifyBackupCode(user.id, backupCode)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid backup code', async () => {
      const user = await userFactory.createWithMfa();

      await expect(
        service.verifyBackupCode(user.id, 'INVALID12')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('disable', () => {
    it('should disable MFA successfully', async () => {
      const user = await userFactory.createWithMfa();

      const result = await service.disableMfa(user.id);

      expect(result.success).toBe(true);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser!.mfaEnabled).toBe(false);
      expect(updatedUser!.mfaSecret).toBeNull();
    });

    it('should delete backup codes on disable', async () => {
      const user = await userFactory.createVerified();
      await service.setupTotp(user.id);
      await service.disableMfa(user.id);

      const backupCodes = await prisma.backupCode.findMany({
        where: { userId: user.id },
      });

      expect(backupCodes).toHaveLength(0);
    });
  });

  describe('regenerateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      const user = await userFactory.createWithMfa();

      const result = await service.regenerateBackupCodes(user.id);

      expect(result).toHaveLength(10);

      const backupCodes = await prisma.backupCode.findMany({
        where: { userId: user.id },
      });

      expect(backupCodes).toHaveLength(10);
    });

    it('should invalidate old backup codes', async () => {
      const user = await userFactory.createVerified();
      const setup = await service.setupTotp(user.id);
      const oldCode = setup.backupCodes[0];

      await service.regenerateBackupCodes(user.id);

      await expect(
        service.verifyBackupCode(user.id, oldCode)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
