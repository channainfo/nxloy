import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { RbacService } from '../rbac.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let rbacService: RbacService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: RbacService,
          useValue: {
            userHasAnyRole: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    rbacService = module.get<RbacService>(RbacService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockContext = (user: any = null): ExecutionContext => {
      return {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user }),
        }),
      } as any;
    };

    it('should allow access if no roles required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if user not authenticated', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['SUPER_ADMIN']);
      const context = createMockContext(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access if user has required role', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['SUPER_ADMIN']);
      jest.spyOn(rbacService, 'userHasAnyRole').mockResolvedValue(true);

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(rbacService.userHasAnyRole).toHaveBeenCalledWith('123', [
        'SUPER_ADMIN',
      ]);
    });

    it('should deny access if user does not have required role', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['SUPER_ADMIN']);
      jest.spyOn(rbacService, 'userHasAnyRole').mockResolvedValue(false);

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should check multiple roles (any match)', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['SUPER_ADMIN', 'BUSINESS_OWNER']);
      jest.spyOn(rbacService, 'userHasAnyRole').mockResolvedValue(true);

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(rbacService.userHasAnyRole).toHaveBeenCalledWith('123', [
        'SUPER_ADMIN',
        'BUSINESS_OWNER',
      ]);
    });

    it('should use correct metadata key', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext();

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
