import { killPort } from '@nx/node/utils';
/* eslint-disable */

module.exports = async function() {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  const port = process.env.PORT;

  if (!port) {
    throw new Error('PORT environment variable is required for E2E tests');
  }

  const portNumber = Number(port);
  if (isNaN(portNumber)) {
    throw new Error(`PORT must be a valid number, got: ${port}`);
  }

  await killPort(portNumber);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
