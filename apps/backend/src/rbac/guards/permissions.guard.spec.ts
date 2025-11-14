import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from '../rbac.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let rbacService: RbacService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: RbacService,
          useValue: {
            userHasAllPermissions: jest.fn(),
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

    guard = module.get<PermissionsGuard>(PermissionsGuard);
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

    it('should allow access if no permissions required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access if user not authenticated', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['customers:read']);
      const context = createMockContext(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access if user has all required permissions', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['customers:read']);
      jest.spyOn(rbacService, 'userHasAllPermissions').mockResolvedValue({
        allowed: true,
        missing: [],
      });

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(rbacService.userHasAllPermissions).toHaveBeenCalledWith('123', [
        'customers:read',
      ]);
    });

    it('should deny access if user missing required permissions', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['customers:read', 'customers:write']);
      jest.spyOn(rbacService, 'userHasAllPermissions').mockResolvedValue({
        allowed: false,
        missing: ['customers:write'],
      });

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should check multiple permissions (all required)', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['customers:read', 'customers:update', 'customers:delete']);
      jest.spyOn(rbacService, 'userHasAllPermissions').mockResolvedValue({
        allowed: true,
        missing: [],
      });

      const context = createMockContext({ userId: '123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(rbacService.userHasAllPermissions).toHaveBeenCalledWith('123', [
        'customers:read',
        'customers:update',
        'customers:delete',
      ]);
    });

    it('should use correct metadata key', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext();

      await guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
    });
  });
});
