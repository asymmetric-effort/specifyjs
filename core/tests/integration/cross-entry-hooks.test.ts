// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Regression test for GitHub issue #58.
 *
 * Verifies that hooks imported from the main entry ('specifyjs') work
 * correctly when the renderer is imported from the DOM entry ('specifyjs/dom').
 * This catches the singleton-duplication bug where each entry point bundle
 * inlines its own copy of the hook dispatcher.
 *
 * In the unit test context, both imports resolve to the same source files
 * (no bundling), so this test validates the architectural contract: the
 * dispatcher set by the DOM renderer must be the same instance read by hooks.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../src/index';
import { useState } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('cross-entry-point hook compatibility (issue #58)', () => {
  it('useState works when renderer is from /dom and hook is from main entry', () => {
    function Counter() {
      const [count] = useState(0);
      return createElement('div', null, `Count: ${count}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');
  });

  it('multiple hooks work in a single component across entries', () => {
    function MultiHook() {
      const [a] = useState('hello');
      const [b] = useState(42);
      return createElement('div', null, `${a} ${b}`);
    }

    const root = createRoot(container);
    root.render(createElement(MultiHook, null));
    expect(container.innerHTML).toBe('<div>hello 42</div>');
  });

  it('dispatcher singleton is shared — __getDispatcher returns the same reference', () => {
    // This is the core assertion: the dispatcher set by the work loop
    // (in dom/work-loop.ts) must be readable by hooks (in hooks/index.ts).
    // If they use different module instances, this fails.
    const { __getDispatcher } = require('../../src/hooks/index');

    function HookTester() {
      // During render, the dispatcher should be set
      const dispatcher = __getDispatcher();
      expect(dispatcher).not.toBeNull();
      return createElement('div', null, 'ok');
    }

    const root = createRoot(container);
    root.render(createElement(HookTester, null));
    expect(container.innerHTML).toBe('<div>ok</div>');
  });
});
