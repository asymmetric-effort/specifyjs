import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'specifyjs': path.resolve(__dirname, 'src/index.ts'),
      'specifyjs/dom': path.resolve(__dirname, 'src/dom/index.ts'),
      'specifyjs/server': path.resolve(__dirname, 'src/server/index.ts'),
      'specifyjs/client': path.resolve(__dirname, 'src/client/index.ts'),
      'specifyjs/telemetry': path.resolve(__dirname, 'src/telemetry/index.ts'),
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
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/benchmarks/**/*.test.ts',
      '../components/*/tests/**/*.test.ts',
      '../components/*/*/tests/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/**/*.d.ts', 'src/components-barrel.ts'],
      thresholds: {
        statements: 97.5,
        branches: 90,
        functions: 98,
        lines: 98,
      },
    },
    setupFiles: ['tests/setup.ts'],
    teardownTimeout: 5000,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
