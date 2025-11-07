/**
 * @nxloy/database - Prisma Client Export
 *
 * Centralized database access layer using Prisma ORM.
 * This package exports the Prisma Client for use across all apps.
 *
 * Usage:
 * ```typescript
 * import { prisma } from '@nxloy/database';
 *
 * const users = await prisma.user.findMany();
 * ```
 *
 * @packageDocumentation
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma Client instance
 *
 * Uses singleton pattern to prevent multiple instances in development
 * (Next.js hot reload can create multiple connections otherwise)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client instance with connection pooling
 *
 * Configuration:
 * - log: Enabled in development for debugging
 * - errorFormat: Pretty formatting for better DX
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Export Prisma types for use in other packages
 *
 * Usage:
 * ```typescript
 * import type { User, Prisma } from '@nxloy/database';
 * ```
 */
export * from '@prisma/client';

/**
 * Graceful shutdown helper
 *
 * Usage in apps:
 * ```typescript
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase();
 *   process.exit(0);
 * });
 * ```
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Health check helper
 *
 * Returns true if database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default prisma;
