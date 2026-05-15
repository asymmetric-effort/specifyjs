import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'specifyjs': path.resolve(__dirname, '../core/src/index.ts'),
      'specifyjs/hooks': path.resolve(__dirname, '../core/src/hooks/index.ts'),
      'specifyjs/dom': path.resolve(__dirname, '../core/src/dom/index.ts'),
      'specifyjs/server': path.resolve(__dirname, '../core/src/server/index.ts'),
      'specifyjs/client': path.resolve(__dirname, '../core/src/client/index.ts'),
      'specifyjs/telemetry': path.resolve(__dirname, '../core/src/telemetry/index.ts'),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/**/*.test.ts',
    ],
    setupFiles: [path.resolve(__dirname, '../core/tests/setup.ts')],
    teardownTimeout: 5000,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
