import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '../../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout for E2E tests
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  console.log('🧪 Test environment initialized');
  console.log('📊 Using test database:', process.env.DATABASE_URL_TEST);
});

afterAll(async () => {
  console.log('✅ Test suite completed');

  // Force disconnect all database connections
  console.log('🔌 Cleaning up database connections...');

  // Give a small delay for cleanup
  await new Promise((resolve) => setTimeout(resolve, 500));
});
