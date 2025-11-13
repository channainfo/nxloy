import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user on successful validation', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      const result = await strategy.validate('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue({
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      await expect(
        strategy.validate('invalid@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if authService.login throws', async () => {
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle case-insensitive email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      await strategy.validate('TEST@EXAMPLE.COM', 'password123');

      expect(authService.login).toHaveBeenCalledWith({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });
    });

    it('should not return password in user object', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      const result = await strategy.validate('test@example.com', 'password123');

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
