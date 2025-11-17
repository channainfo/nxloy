import { PrismaClient } from '@nxloy/database';

/**
 * Database Helper for Tests
 * Manages test database cleanup and isolation
 *
 * Usage:
 * - beforeAll: Initialize helper
 * - afterEach: Clean up test data
 * - afterAll: Disconnect
 */
export class DatabaseHelper {
  private prisma: PrismaClient;
  private isConnected = false;

  constructor() {
    // CRITICAL: Never fall back to production database
    // Tests must use dedicated test database to prevent data loss
    const testDatabaseUrl = process.env.DATABASE_URL_TEST;

    if (!testDatabaseUrl) {
      throw new Error(
        'DATABASE_URL_TEST environment variable is required for tests. ' +
        'Never use production database for testing!'
      );
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.prisma.$connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
      } catch (error) {
        console.warn('DatabaseHelper disconnect error:', error);
      }
    }
  }

  async cleanDatabase(): Promise<void> {
    const tables = await this.getTables();
    await this.truncateTables(tables);
  }

  private async getTables(): Promise<string[]> {
    const result = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;
    return result.map((row) => row.tablename);
  }

  private async truncateTables(tables: string[]): Promise<void> {
    const excludedTables = ['_prisma_migrations'];
    const tablesToTruncate = tables.filter(
      (table) => !excludedTables.includes(table)
    );

    // Use transaction for faster cleanup
    try {
      await this.prisma.$transaction(
        tablesToTruncate.map((table) =>
          this.prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`
          )
        )
      );
    } catch (error) {
      console.warn('Failed to truncate tables in transaction:', error);
      // Fallback to individual truncation if transaction fails
      for (const table of tablesToTruncate) {
        await this.truncateTable(table);
      }
    }
  }

  private async truncateTable(tableName: string): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`
      );
    } catch (error) {
      // Ignore errors for tables that don't exist or can't be truncated
      console.warn(`Failed to truncate table ${tableName}:`, error);
    }
  }

  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}
