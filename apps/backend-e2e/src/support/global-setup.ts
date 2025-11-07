import { waitForPortOpen } from '@nx/node/utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function() {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const host = process.env.HOST;
  const port = process.env.PORT;

  if (!host) {
    throw new Error('HOST environment variable is required for E2E tests');
  }
  if (!port) {
    throw new Error('PORT environment variable is required for E2E tests');
  }

  const portNumber = Number(port);
  if (isNaN(portNumber)) {
    throw new Error(`PORT must be a valid number, got: ${port}`);
  }

  await waitForPortOpen(portNumber, { host });

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};

