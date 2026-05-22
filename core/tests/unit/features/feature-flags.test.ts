import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { FeatureFlagProvider, FeatureGate, useFeatureFlags } from '../../../src/features/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('FeatureFlagProvider', () => {
  it('renders children', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: {} },
        createElement('div', { id: 'child' }, 'content'),
      ),
    );
    expect(container.querySelector('#child')).toBeTruthy();
    root.unmount();
  });

  it('provides default flags', () => {
    let captured: Record<string, boolean> = {};
    function Inspector() {
      const { flags } = useFeatureFlags();
      captured = flags;
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { alpha: true, beta: false } },
        createElement(Inspector, null),
      ),
    );
    expect(captured.alpha).toBe(true);
    expect(captured.beta).toBe(false);
    root.unmount();
  });
});

describe('FeatureGate', () => {
  it('renders children when flag is enabled', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { feature: true } },
        createElement(
          FeatureGate,
          { flag: 'feature' },
          createElement('span', { id: 'gated' }, 'visible'),
        ),
      ),
    );
    expect(container.querySelector('#gated')).toBeTruthy();
    root.unmount();
  });

  it('renders nothing when flag is disabled', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { feature: false } },
        createElement(
          FeatureGate,
          { flag: 'feature' },
          createElement('span', { id: 'gated' }, 'hidden'),
        ),
      ),
    );
    expect(container.querySelector('#gated')).toBeNull();
    root.unmount();
  });

  it('renders fallback when flag is disabled', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { feature: false } },
        createElement(
          FeatureGate,
          {
            flag: 'feature',
            fallback: createElement('span', { id: 'fallback' }, 'off'),
          },
          createElement('span', { id: 'gated' }, 'on'),
        ),
      ),
    );
    expect(container.querySelector('#gated')).toBeNull();
    expect(container.querySelector('#fallback')).toBeTruthy();
    root.unmount();
  });

  it('renders nothing for unknown flag', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: {} },
        createElement(
          FeatureGate,
          { flag: 'unknown' },
          createElement('span', { id: 'gated' }, 'hidden'),
        ),
      ),
    );
    expect(container.querySelector('#gated')).toBeNull();
    root.unmount();
  });
});

describe('useFeatureFlags', () => {
  it('isEnabled returns correct state', () => {
    let result = false;
    function Inspector() {
      const { isEnabled } = useFeatureFlags();
      result = isEnabled('test');
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { test: true } },
        createElement(Inspector, null),
      ),
    );
    expect(result).toBe(true);
    root.unmount();
  });

  it('isEnabled returns false for missing flag', () => {
    let result = true;
    function Inspector() {
      const { isEnabled } = useFeatureFlags();
      result = isEnabled('nonexistent');
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(FeatureFlagProvider, { defaults: {} }, createElement(Inspector, null)),
    );
    expect(result).toBe(false);
    root.unmount();
  });

  it('loading is false when no URL provided', () => {
    let loadingState = true;
    function Inspector() {
      const { loading } = useFeatureFlags();
      loadingState = loading;
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(FeatureFlagProvider, { defaults: {} }, createElement(Inspector, null)),
    );
    expect(loadingState).toBe(false);
    root.unmount();
  });

  it('setFlag updates flag state', async () => {
    let setFlagFn: (flag: string, enabled: boolean) => void;
    let isEnabledFn: (flag: string) => boolean;
    function Inspector() {
      const { isEnabled, setFlag } = useFeatureFlags();
      setFlagFn = setFlag;
      isEnabledFn = isEnabled;
      return createElement('div', null, isEnabled('test') ? 'on' : 'off');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { test: false } },
        createElement(Inspector, null),
      ),
    );
    expect(isEnabledFn!('test')).toBe(false);
    setFlagFn!('test', true);
    // Re-render to pick up state change
    await new Promise((r) => setTimeout(r, 50));
    root.render(
      createElement(
        FeatureFlagProvider,
        { defaults: { test: false } },
        createElement(Inspector, null),
      ),
    );
    root.unmount();
  });

  it('fetches flags from URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ remote: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    let capturedFlags: Record<string, boolean> = {};
    function Inspector() {
      const { flags } = useFeatureFlags();
      capturedFlags = flags;
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { url: 'https://example.com/flags.json', defaults: { local: true } },
        createElement(Inspector, null),
      ),
    );

    await new Promise((r) => setTimeout(r, 100));
    root.render(
      createElement(
        FeatureFlagProvider,
        { url: 'https://example.com/flags.json', defaults: { local: true } },
        createElement(Inspector, null),
      ),
    );

    expect(mockFetch).toHaveBeenCalled();
    root.unmount();
    vi.unstubAllGlobals();
  });

  it('handles fetch failure gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', mockFetch);

    let loadingState = true;
    function Inspector() {
      const { loading } = useFeatureFlags();
      loadingState = loading;
      return createElement('div', null, 'ok');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        FeatureFlagProvider,
        { url: 'https://example.com/flags.json' },
        createElement(Inspector, null),
      ),
    );

    await new Promise((r) => setTimeout(r, 100));
    root.render(
      createElement(
        FeatureFlagProvider,
        { url: 'https://example.com/flags.json' },
        createElement(Inspector, null),
      ),
    );
    root.unmount();
    vi.unstubAllGlobals();
  });
});
