const { existsSync } = require('node:fs');
const { defineConfig } = require('@playwright/test');

const localBrave = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const executablePath = process.env.BROWSER_EXECUTABLE
  || (existsSync(localBrave) ? localBrave : undefined);
const baseURL = 'http://127.0.0.1:8000';

module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL, launchOptions: { executablePath } },
  webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: !process.env.CI }
});
