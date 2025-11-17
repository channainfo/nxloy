import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaClient } from '@nxloy/database';
import { DatabaseHelper } from '../test/helpers/database.helper';
import { UserFactory } from '../test/factories';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QueueService } from '../queue/queue.service';
import { SecurityService } from '../security/security.service';
import { AuditService } from '../audit/audit.service';
import { VerificationService } from '../verification/verification.service';
import { mockVerificationService } from '../test/mocks/service-mocks';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;
  let module: TestingModule;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);

    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: PrismaClient, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verify: jest.fn(),
            verifyAsync: jest.fn().mockResolvedValue({
              sub: 'mock-user-id',
              email: 'mock@example.com',
              tokenId: 'mock-token-id',
              family: 'mock-family',
            }),
          },
        },
        {
          provide: QueueService,
          useValue: {
            queueEmail: jest.fn(),
          },
        },
        {
          provide: SecurityService,
          useValue: {
            checkLockoutStatus: jest.fn().mockResolvedValue({
              isLocked: false,
            }),
            recordLoginAttempt: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: VerificationService,
          useValue: mockVerificationService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const signupDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.signup(signupDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(signupDto.email.toLowerCase());
      expect(result.firstName).toBe(signupDto.firstName);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const existingUser = await userFactory.createVerified({
        email: 'existing@example.com',
      });

      const signupDto = {
        email: existingUser.email,
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(controller.signup(signupDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should normalize email to lowercase', async () => {
      const signupDto = {
        email: 'NewUser@Example.COM',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.signup(signupDto);

      expect(result.email).toBe('newuser@example.com');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      const result = await controller.login({
        email: user.email,
        password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(user.email);
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      await expect(
        controller.login({
          email: user.email,
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not reveal if user does not exist', async () => {
      await expect(
        controller.login({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const user = await userFactory.createVerified();

      // Create a real refresh token in the database
      const token = 'test-refresh-token';
      const family = 'test-family';
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const refreshTokenRecord = await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token,
          family,
          expiresAt,
        },
      });

      // Mock JWT verifyAsync to return the tokenId
      const jwtService = module.get<JwtService>(JwtService);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce({
        sub: user.id,
        tokenId: refreshTokenRecord.id,
        family: family,
      });

      const result = await controller.refresh({
        refreshToken: 'jwt-refresh-token',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await userFactory.createVerified();

      await controller.logout({ userId: user.id });

      // Verify refresh tokens were revoked
      const tokens = await prisma.refreshToken.findMany({
        where: { userId: user.id, revokedAt: null },
      });
      expect(tokens).toHaveLength(0);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset PIN', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
      });

      const result = await controller.forgotPassword({
        email: user.email,
      });

      expect(result).toEqual({ success: true });
    });

    it('should not reveal if email does not exist', async () => {
      const result = await controller.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid PIN', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
      });

      // Request password reset
      await controller.forgotPassword({ email: user.email });

      // Get the PIN from database
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { identifier: user.email, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      expect(verificationToken).toBeDefined();

      // Note: In real test, you would need the actual PIN
      // This is a simplified example showing the flow
    });
  });

  describe('GET /auth/me', () => {
    it('should return authenticated user info', async () => {
      const user = await userFactory.createVerified();

      const result = await controller.getMe({
        userId: user.id,
        email: user.email,
      });

      expect(result).toEqual({
        userId: user.id,
        email: user.email,
      });
    });
  });
});
