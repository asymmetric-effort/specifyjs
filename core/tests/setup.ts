// Vitest test setup
// jsdom environment is configured in vitest.config.ts

// Disable component ID assignment by default in tests to avoid
// breaking existing innerHTML assertions. Tests that specifically
// validate component IDs should call setComponentIdsEnabled(true).
import { setComponentIdsEnabled } from '../src/shared/component-registry';
setComponentIdsEnabled(false);
