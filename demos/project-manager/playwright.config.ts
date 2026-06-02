import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'cd ../../site && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
