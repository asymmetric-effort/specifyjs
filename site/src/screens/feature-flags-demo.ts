// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { useHead } from 'specifyjs/hooks';
import { useFeatureFlags, FeatureGate } from 'specifyjs';

export function FeatureFlagsDemo() {
  useHead({
    title: 'Feature Flags — SpecifyJS',
    description:
      'Feature flag system demo: conditionally render components based on runtime flag state.',
    keywords: 'specifyjs, feature flags, feature gates, conditional rendering',
    author: 'Asymmetric Effort, LLC',
  });

  const { flags, isEnabled, setFlag, loading } = useFeatureFlags();

  if (loading) {
    return createElement(
      'div',
      { style: { textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' } },
      'Loading feature flags...',
    );
  }

  const flagNames = Object.keys(flags).sort();

  return createElement(
    'div',
    null,
    createElement(
      'p',
      {
        style: {
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
          lineHeight: '1.7',
          fontSize: '15px',
        },
      },
      'Feature flags allow you to conditionally render components based on runtime state. Flags can be loaded from a static JSON file or toggled programmatically. Toggle the flags below to see components appear and disappear.',
    ),

    // Flag toggles
    createElement(
      'div',
      { className: 'section' },
      createElement('h3', { style: { fontSize: '17px', fontWeight: '700', marginBottom: '16px' } }, 'Flag Controls'),
      createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        ...flagNames.map((name) =>
          createElement(
            'div',
            {
              key: name,
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                background: isEnabled(name) ? 'var(--color-bg-muted)' : 'var(--color-bg-subtle)',
              },
            },
            createElement(
              'span',
              {
                style: {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              },
              name,
            ),
            createElement(
              'div',
              {
                className: 'demo-toggle',
                role: 'button',
                tabIndex: 0,
                onClick: () => setFlag(name, !isEnabled(name)),
              },
              createElement(
                'div',
                {
                  className: `demo-toggle-track ${isEnabled(name) ? 'on' : ''}`,
                },
                createElement('div', { className: 'demo-toggle-thumb' }),
              ),
            ),
          ),
        ),
      ),
    ),

    // Gated features
    createElement(
      'div',
      { className: 'section', style: { marginTop: '32px' } },
      createElement('h3', { style: { fontSize: '17px', fontWeight: '700', marginBottom: '16px' } }, 'Gated Components'),

      createElement(
        FeatureGate,
        { flag: 'dashboard', fallback: gatedOff('dashboard') },
        gatedOn('dashboard', 'Economic Dashboard is accessible.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'concurrent-rendering', fallback: gatedOff('concurrent-rendering') },
        gatedOn('concurrent-rendering', 'Concurrent rendering demo is accessible.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'component-reference', fallback: gatedOff('component-reference') },
        gatedOn('component-reference', 'Component Reference page is accessible.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'getting-started', fallback: gatedOff('getting-started') },
        gatedOn('getting-started', 'Getting Started guide is accessible.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'dark-mode', fallback: gatedOff('dark-mode') },
        gatedOn('dark-mode', 'Dark mode toggle is visible in the nav bar.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'experimental-3d', fallback: gatedOff('experimental-3d') },
        gatedOn('experimental-3d', '3D visualization layer is enabled.'),
      ),

      createElement(
        FeatureGate,
        { flag: 'feature-flags-demo', fallback: gatedOff('feature-flags-demo') },
        gatedOn('feature-flags-demo', 'This demo page is enabled via its own flag.'),
      ),
    ),

    // Code example
    createElement(
      'div',
      { className: 'section', style: { marginTop: '32px' } },
      createElement('h3', { style: { fontSize: '17px', fontWeight: '700', marginBottom: '12px' } }, 'Usage'),
      createElement(
        'pre',
        { className: 'code-block' },
        `import { FeatureFlagProvider, FeatureGate, useFeatureFlags } from 'specifyjs';

// Wrap app with provider (loads flags from JSON)
createElement(FeatureFlagProvider, { url: '/features.json' },
  createElement(App, null),
);

// Gate a component
createElement(FeatureGate, { flag: 'dark-mode', fallback: null },
  createElement(DarkModeToggle, null),
);

// Use hook for custom logic
function MyComponent() {
  const { isEnabled, setFlag } = useFeatureFlags();
  if (isEnabled('beta-charts')) {
    return createElement(BetaCharts, null);
  }
  return createElement(StandardCharts, null);
}`,
      ),
    ),
  );
}

function gatedOn(flag: string, message: string) {
  return createElement(
    'div',
    {
      style: {
        padding: '12px 16px',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#22c55e',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      },
    },
    createElement('span', null, '\u2705'),
    createElement('span', null, `${flag}: ${message}`),
  );
}

function gatedOff(flag: string) {
  return createElement(
    'div',
    {
      style: {
        padding: '12px 16px',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#ef4444',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      },
    },
    createElement('span', null, '\u274c'),
    createElement('span', null, `${flag}: disabled — component not rendered`),
  );
}
