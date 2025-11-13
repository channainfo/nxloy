import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, Status } from '@nxloy/database';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { DatabaseHelper } from '../test/helpers/database.helper';
import { UserFactory } from '../test/factories';
import * as bcrypt from 'bcrypt';
import { QueueService } from '../queue/queue.service';
import { SecurityService } from '../security/security.service';
import { AuditService } from '../audit/audit.service';
import { VerificationService } from '../verification/verification.service';
import { mockVerificationService } from '../test/mocks/service-mocks';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;
  let jwtService: JwtService;
  let queueService: QueueService;
  let securityService: SecurityService;
  let auditService: AuditService;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaClient, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
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
            checkLockoutStatus: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    queueService = module.get<QueueService>(QueueService);
    securityService = module.get<SecurityService>(SecurityService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signupDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(signupDto.email.toLowerCase());
      expect(result.firstName).toBe(signupDto.firstName);
      expect(result.lastName).toBe(signupDto.lastName);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email exists', async () => {
      const user = await userFactory.createVerified({
        email: 'existing@example.com',
      });

      const signupDto = {
        email: user.email,
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should hash the password correctly', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await service.signup(signupDto);

      const user = await prisma.user.findUnique({
        where: { email: signupDto.email.toLowerCase() },
      });

      const passwordMatches = await bcrypt.compare(
        signupDto.password,
        user!.passwordHash
      );
      expect(passwordMatches).toBe(true);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      jest
        .spyOn(securityService, 'checkLockoutStatus')
        .mockResolvedValue({ isLocked: false });

      const result = await service.login({
        email: user.email,
        password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(user.email);
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      jest
        .spyOn(securityService, 'checkLockoutStatus')
        .mockResolvedValue({ isLocked: false });

      await expect(
        service.login({
          email: user.email,
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      const user = await userFactory.createLocked({
        email: 'locked@example.com',
      });

      jest.spyOn(securityService, 'checkLockoutStatus').mockResolvedValue({
        isLocked: true,
        lockedUntil: user.lockedUntil,
      });

      await expect(
        service.login({
          email: user.email,
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update lastLoginAt on successful login', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      jest
        .spyOn(securityService, 'checkLockoutStatus')
        .mockResolvedValue({ isLocked: false });

      const beforeLogin = user.lastLoginAt;
      await service.login({ email: user.email, password });

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser!.lastLoginAt).not.toBe(beforeLogin);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      const result = await service.validateUser(user.email, password);

      expect(result).toBeDefined();
      expect(result!.email).toBe(user.email);
    });

    it('should return null if password is invalid', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      const result = await service.validateUser(user.email, 'WrongPassword!');

      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      const result = await service.validateUser(
        'nonexistent@example.com',
        'Password123!'
      );

      expect(result).toBeNull();
    });

    it('should return null if user status is not ACTIVE', async () => {
      const user = await userFactory.create({
        email: 'suspended@example.com',
        status: Status.SUSPENDED,
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      const result = await service.validateUser(user.email, 'Password123!');

      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const user = await userFactory.createVerified();

      const result = await service.generateTokens(user.id, user.email);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });
  });

  describe('excludePassword', () => {
    it('should exclude passwordHash from user object', async () => {
      const user = await userFactory.createVerified();

      const result = service['excludePassword'](user);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('id');
    });
  });
});
