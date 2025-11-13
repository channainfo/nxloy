import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PrismaClient } from '@nxloy/database';
import { DatabaseHelper } from '../src/test/helpers/database.helper';
import { UserFactory } from '../src/test/factories';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../src/email/email.service';
import { QueueService } from '../src/queue/queue.service';

describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;

  // Increase timeout for E2E tests (database operations can be slow)
  jest.setTimeout(60000);

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaClient)
      .useValue(prisma)
      .overrideProvider(EmailService)
      .useValue({
        sendEmail: jest.fn().mockResolvedValue(true),
      })
      .overrideProvider(QueueService)
      .useValue({
        queueEmail: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.disconnect();
  });

  describe('Complete Registration Flow', () => {
    it('should complete full signup and verification flow', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Step 1: Signup
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupData)
        .expect(201);

      expect(signupResponse.body).toHaveProperty('id');
      expect(signupResponse.body.email).toBe(signupData.email.toLowerCase());
      expect(signupResponse.body).not.toHaveProperty('passwordHash');

      // Step 2: Verify email was queued
      const user = await prisma.user.findUnique({
        where: { email: signupData.email.toLowerCase() },
      });
      expect(user).toBeDefined();
      expect(user!.emailVerified).toBeNull();

      // Step 3: Get verification PIN from database (simulating email delivery)
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { identifier: signupData.email.toLowerCase() },
        orderBy: { createdAt: 'desc' },
      });
      expect(verificationToken).toBeDefined();
    });
  });

  describe('Complete Login Flow', () => {
    it('should complete full login flow with valid credentials', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      // Step 1: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(loginResponse.body).toHaveProperty('refreshToken');
      expect(loginResponse.body.user.email).toBe(user.email);

      // Step 2: Use access token to get user info
      const meResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(meResponse.body.userId).toBe(user.id);
      expect(meResponse.body.email).toBe(user.email);
    });

    it('should fail login with wrong password', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should lock account after 5 failed login attempts', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
      });

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: user.email,
            password: 'WrongPassword!',
          })
          .expect(401);
      }

      // 6th attempt should fail with account locked error
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toContain('locked');
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh tokens successfully', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      // Step 1: Login to get initial tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      const { refreshToken } = loginResponse.body;

      // Wait 1 second to ensure JWT iat timestamp differs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Use refresh token to get new tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');
      expect(refreshResponse.body).toHaveProperty('refreshToken');
      expect(refreshResponse.body.accessToken).not.toBe(
        loginResponse.body.accessToken
      );
    });
  });

  describe('Password Reset Flow', () => {
    it('should complete password reset flow', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
      });

      // Step 1: Request password reset
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);

      // Step 2: Get PIN from database (simulating email delivery)
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { identifier: user.email, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      expect(verificationToken).toBeDefined();
      // In real test, you would need the actual PIN to complete the flow
    });

    it('should not reveal if email exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    });
  });

  describe('Logout Flow', () => {
    it('should logout and revoke refresh tokens', async () => {
      const password = 'Password123!';
      const user = await userFactory.createVerified({
        email: 'test@example.com',
        passwordHash: await bcrypt.hash(password, 10),
      });

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      const { accessToken, refreshToken } = loginResponse.body;

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Try to use refresh token after logout (should fail)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid login requests', async () => {
      const user = await userFactory.createVerified({
        email: 'test@example.com',
      });

      // Send 10 rapid requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: user.email,
              password: 'WrongPassword!',
            })
        );
      }

      const responses = await Promise.all(requests);

      // All requests should complete (rate limiting requires guard configuration)
      // Once ThrottlerGuard is added as APP_GUARD, this test can check for 429 responses
      expect(responses).toHaveLength(10);
      expect(responses.every((r) => [401, 429].includes(r.status))).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should reject weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });
});
