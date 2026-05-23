// Test setup
// DOM environment is configured in setup-nogginlessdom.ts

// Disable component ID assignment by default in tests to avoid
// breaking existing innerHTML assertions. Tests that specifically
// validate component IDs should call setComponentIdsEnabled(true).
import { setComponentIdsEnabled } from '../src/shared/component-registry';
setComponentIdsEnabled(false);
