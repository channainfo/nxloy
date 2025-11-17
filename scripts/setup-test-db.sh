#!/bin/bash

# Setup Test Database Script
# Creates and migrates test database for running tests

set -e

echo "🔧 Setting up test database..."

# Load test environment variables
export $(cat .env.test | grep -v '^#' | xargs)

# Create test database if it doesn't exist
echo "📦 Creating test database if it doesn't exist..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'nxloy_test'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE nxloy_test"

# Run migrations on test database
echo "🔄 Running migrations on test database..."
cd packages/database
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma migrate deploy
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma generate

echo "✅ Test database setup complete!"
echo "📊 Database: nxloy_test"
echo "🧪 Ready to run tests with: nx test backend"
