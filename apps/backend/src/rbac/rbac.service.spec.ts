import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { PrismaClient } from '@nxloy/database';
import { DatabaseHelper } from '../test/helpers/database.helper';
import { UserFactory } from '../test/factories';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RbacService', () => {
  let service: RbacService;
  let prisma: PrismaClient;
  let dbHelper: DatabaseHelper;
  let userFactory: UserFactory;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
    prisma = dbHelper.getPrismaClient();
    userFactory = new UserFactory(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService, { provide: PrismaClient, useValue: prisma }],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  afterEach(async () => {
    await dbHelper.cleanDatabase();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  describe('initializeSystemRoles', () => {
    it('should create 5 system roles', async () => {
      await service.initializeSystemRoles();

      const roles = await prisma.role.findMany({
        where: { isSystem: true },
      });

      expect(roles).toHaveLength(5);
      expect(roles.map((r) => r.name)).toContain('SUPER_ADMIN');
      expect(roles.map((r) => r.name)).toContain('BUSINESS_OWNER');
      expect(roles.map((r) => r.name)).toContain('BUSINESS_MANAGER');
      expect(roles.map((r) => r.name)).toContain('CUSTOMER');
      expect(roles.map((r) => r.name)).toContain('SUPPORT_AGENT');
    });

    it('should be idempotent - not duplicate on second call', async () => {
      await service.initializeSystemRoles();
      await service.initializeSystemRoles();

      const roles = await prisma.role.findMany({
        where: { isSystem: true },
      });

      expect(roles).toHaveLength(5);
    });
  });

  describe('createRole', () => {
    it('should create custom role successfully', async () => {
      const roleData = {
        name: 'CUSTOM_ROLE',
        description: 'Custom role for testing',
        isSystem: false,
        permissionIds: [],
      };

      const role = await service.createRole(roleData);

      expect(role.name).toBe(roleData.name);
      expect(role.isSystem).toBe(false);
    });

    it('should throw BadRequestException for duplicate role name', async () => {
      await service.initializeSystemRoles();

      await expect(
        service.createRole({
          name: 'SUPER_ADMIN',
          description: 'Duplicate',
          isSystem: false,
          permissionIds: [],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const role = await prisma.role.findFirst({
        where: { name: 'CUSTOMER' },
      });

      const userRole = await service.assignRoleToUser(user.id, {
        roleId: role!.id,
      });

      expect(userRole.userId).toBe(user.id);
      expect(userRole.roleId).toBe(role!.id);
    });

    it('should throw NotFoundException for invalid user', async () => {
      await service.initializeSystemRoles();
      const role = await prisma.role.findFirst();

      await expect(
        service.assignRoleToUser('invalid-user-id', {
          roleId: role!.id,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid role', async () => {
      const user = await userFactory.createVerified();

      await expect(
        service.assignRoleToUser(user.id, {
          roleId: 'invalid-role-id',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('userHasRole', () => {
    it('should return true if user has role', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const role = await prisma.role.findFirst({
        where: { name: 'CUSTOMER' },
      });

      await service.assignRoleToUser(user.id, {
        roleId: role!.id,
      });

      const hasRole = await service.userHasRole(user.id, 'CUSTOMER');

      expect(hasRole).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const role = await prisma.role.findFirst({
        where: { name: 'SUPER_ADMIN' },
      });

      const hasRole = await service.userHasRole(user.id, role!.id);

      expect(hasRole).toBe(false);
    });
  });

  describe('userHasAnyRole', () => {
    it('should return true if user has any of the roles', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const customerRole = await prisma.role.findFirst({
        where: { name: 'CUSTOMER' },
      });
      const adminRole = await prisma.role.findFirst({
        where: { name: 'SUPER_ADMIN' },
      });

      await service.assignRoleToUser(user.id, {
        roleId: customerRole!.id,
      });

      const hasAnyRole = await service.userHasAnyRole(user.id, [
        'CUSTOMER',
        'SUPER_ADMIN',
      ]);

      expect(hasAnyRole).toBe(true);
    });

    it('should return false if user has none of the roles', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();

      const hasAnyRole = await service.userHasAnyRole(user.id, [
        'SUPER_ADMIN',
        'BUSINESS_OWNER',
      ]);

      expect(hasAnyRole).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return all roles for user', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const customerRole = await prisma.role.findFirst({
        where: { name: 'CUSTOMER' },
      });
      const supportRole = await prisma.role.findFirst({
        where: { name: 'SUPPORT_AGENT' },
      });

      await service.assignRoleToUser(user.id, {
        roleId: customerRole!.id,
      });
      await service.assignRoleToUser(user.id, {
        roleId: supportRole!.id,
      });

      const userRoles = await service.getUserRoles(user.id);

      expect(userRoles).toHaveLength(2);
    });

    it('should return empty array if user has no roles', async () => {
      const user = await userFactory.createVerified();

      const userRoles = await service.getUserRoles(user.id);

      expect(userRoles).toHaveLength(0);
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove role from user', async () => {
      await service.initializeSystemRoles();
      const user = await userFactory.createVerified();
      const role = await prisma.role.findFirst({
        where: { name: 'CUSTOMER' },
      });

      await service.assignRoleToUser(user.id, {
        roleId: role!.id,
      });

      await service.removeRoleFromUser(user.id, role!.id);

      const hasRole = await service.userHasRole(user.id, 'CUSTOMER');
      expect(hasRole).toBe(false);
    });
  });
});
