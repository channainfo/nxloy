/* eslint-disable */
import axios from 'axios';

module.exports = async function() {
  // Configure axios for tests to use.
  const host = process.env.HOST;
  const port = process.env.PORT;

  if (!host) {
    throw new Error('HOST environment variable is required for E2E tests');
  }
  if (!port) {
    throw new Error('PORT environment variable is required for E2E tests');
  }

  axios.defaults.baseURL = `http://${host}:${port}`;
};
