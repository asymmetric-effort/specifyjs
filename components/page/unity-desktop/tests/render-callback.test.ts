// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { UnityDesktop } from '../src/index';
import type { UnityDesktopApp } from '../src/index';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { useWindowManager } from '../../../layout/window-manager/src/index';

let container: HTMLDivElement;

/** Flush microtasks to allow deferred state updates */
async function flush(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => queueMicrotask(r));
  }
}

function render(vnode: unknown): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

beforeEach(() => {
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

describe('UnityDesktopApp render callback', () => {
  it('accepts the optional render field in UnityDesktopApp', () => {
    const renderFn = (windowId: string) => createElement('div', null, `Custom content for ${windowId}`);

    const app: UnityDesktopApp = {
      id: 'custom-app',
      icon: '\u{1F4BB}',
      label: 'Custom App',
      render: renderFn,
    };

    expect(app.render).toBe(renderFn);
    expect(app.id).toBe('custom-app');
    expect(app.icon).toBe('\u{1F4BB}');
    expect(app.label).toBe('Custom App');
  });

  it('accepts UnityDesktopApp without render field (backward compatible)', () => {
    const app: UnityDesktopApp = {
      id: 'basic-app',
      icon: '\u{1F4C1}',
      label: 'Basic App',
    };

    expect(app.render).toBeUndefined();
    expect(app.id).toBe('basic-app');
  });

  it('calls render callback instead of getMockContent when render is provided', async () => {
    const renderSpy = vi.fn((windowId: string) =>
      createElement('div', { className: 'custom-render-output' }, `Rendered: ${windowId}`),
    );

    const apps: UnityDesktopApp[] = [
      { id: 'custom', icon: '\u{2B50}', label: 'Custom', render: renderSpy },
    ];

    const el = render(createElement(UnityDesktop, { apps }));
    await flush();

    // Click the dock item to open the app window
    const dockButtons = el.querySelectorAll('button');
    let dockBtn: HTMLElement | null = null;
    for (let i = 0; i < dockButtons.length; i++) {
      const btn = dockButtons[i] as HTMLElement;
      if (btn.getAttribute('aria-label')?.includes('Custom') || btn.textContent?.includes('\u{2B50}')) {
        dockBtn = btn;
        break;
      }
    }

    if (dockBtn) {
      dockBtn.click();
      await flush();

      // The render callback should have been called
      expect(renderSpy).toHaveBeenCalled();
      // Verify the custom content is in the DOM
      const customOutput = el.querySelector('.custom-render-output');
      expect(customOutput).not.toBeNull();
      expect(customOutput?.textContent).toContain('Rendered:');
    }
  });

  it('falls back to getMockContent when render is not provided', async () => {
    const apps: UnityDesktopApp[] = [
      { id: 'files', icon: '\u{1F4C1}', label: 'Files' },
    ];

    const el = render(createElement(UnityDesktop, { apps }));
    await flush();

    // Click the dock item to open Files
    const dockButtons = el.querySelectorAll('button');
    let dockBtn: HTMLElement | null = null;
    for (let i = 0; i < dockButtons.length; i++) {
      const btn = dockButtons[i] as HTMLElement;
      if (btn.getAttribute('aria-label')?.includes('Files') || btn.textContent?.includes('\u{1F4C1}')) {
        dockBtn = btn;
        break;
      }
    }

    if (dockBtn) {
      dockBtn.click();
      await flush();

      // Should render the mock Files content (contains "Home" text from FilesContent)
      const text = el.textContent || '';
      expect(text).toContain('Home');
    }
  });
});

describe('useWindowManager export', () => {
  it('is importable from window-manager package', () => {
    expect(typeof useWindowManager).toBe('function');
  });
});
