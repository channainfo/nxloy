import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuditService } from '../audit/audit.service';
import { PrismaClient } from '@nxloy/database';
import { BadRequestException } from '@nestjs/common';
import { UserFactory } from '../test/factories/user.factory';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaClient;
  let userFactory: UserFactory;
  let auditService: AuditService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    userFactory = new UserFactory(prisma);
    auditService = new AuditService(prisma);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AuditService,
          useValue: auditService,
        },
        {
          provide: PrismaClient,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const user = await userFactory.createVerified();

      const profile = await service.getProfile(user.id);

      expect(profile).toBeDefined();
      expect(profile.id).toBe(user.id);
      expect(profile.email).toBe(user.email);
      expect(profile.firstName).toBe(user.firstName);
      expect(profile.lastName).toBe(user.lastName);
      expect(profile).not.toHaveProperty('passwordHash');

      // Cleanup
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if user not found', async () => {
      const nonExistentId = faker.string.uuid();

      await expect(service.getProfile(nonExistentId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should include verification status', async () => {
      const user = await userFactory.createVerified({
        phoneVerified: new Date(),
      });

      const profile = await service.getProfile(user.id);

      expect(profile.emailVerified).toBeDefined();
      expect(profile.phoneVerified).toBeDefined();

      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should include MFA status', async () => {
      const user = await userFactory.createWithMfa();

      const profile = await service.getProfile(user.id);

      expect(profile.mfaEnabled).toBe(true);

      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = await userFactory.create();

      const updateDto = {
        firstName: 'Updated',
        lastName: 'Name',
        timezone: 'America/Los_Angeles',
      };

      const updated = await service.updateProfile(user.id, updateDto);

      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe('Name');
      expect(updated.timezone).toBe('America/Los_Angeles');

      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });

    it('should not include password in response', async () => {
      const user = await userFactory.create();

      const updated = await service.updateProfile(user.id, {
        firstName: 'Test',
      });

      expect(updated).not.toHaveProperty('passwordHash');

      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });

    it('should log audit event', async () => {
      const user = await userFactory.create();

      await service.updateProfile(user.id, { firstName: 'Test' });

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: user.id, resource: 'User' },
      });

      expect(auditLogs.length).toBeGreaterThan(0);

      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });
  });

  describe('getSessions', () => {
    it('should return active sessions only', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      // Create active session
      const activeSession = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      // Create expired session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: pastDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      const sessions = await service.getSessions(user.id);

      expect(sessions.length).toBe(1);
      expect(sessions[0].id).toBe(activeSession.id);

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should exclude revoked sessions', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      // Create active session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      // Create revoked session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          revokedAt: new Date(),
        },
      });

      const sessions = await service.getSessions(user.id);

      expect(sessions.length).toBe(1);
      expect(sessions[0].revokedAt).toBeNull();

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('revokeSession', () => {
    it('should revoke specific session', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      const result = await service.revokeSession(user.id, session.id);

      expect(result.success).toBe(true);

      const revokedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });

      expect(revokedSession.revokedAt).toBeDefined();

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });

    it('should log audit event', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      await service.revokeSession(user.id, session.id);

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: user.id, resource: 'Session' },
      });

      expect(auditLogs.length).toBeGreaterThan(0);

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions except current', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const currentSession = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      const otherSession = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      await service.revokeAllSessions(user.id, currentSession.id);

      const current = await prisma.session.findUnique({
        where: { id: currentSession.id },
      });
      const other = await prisma.session.findUnique({
        where: { id: otherSession.id },
      });

      expect(current.revokedAt).toBeNull();
      expect(other.revokedAt).toBeDefined();

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });

    it('should revoke all sessions if no current session specified', async () => {
      const user = await userFactory.create();

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: futureDate,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      });

      await service.revokeAllSessions(user.id);

      const sessions = await prisma.session.findMany({
        where: { userId: user.id, revokedAt: null },
      });

      expect(sessions.length).toBe(0);

      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });

    it('should log audit event', async () => {
      const user = await userFactory.create();

      await service.revokeAllSessions(user.id);

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: user.id, resource: 'Session' },
      });

      expect(auditLogs.length).toBeGreaterThan(0);

      await prisma.user.delete({ where: { id: user.id } });
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    });
  });
});
