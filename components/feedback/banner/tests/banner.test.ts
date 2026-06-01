// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Banner } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Helper to extract children array from a Banner vnode
// ---------------------------------------------------------------------------

function getChildren(el: any): any[] {
  if (!el) return [];
  return Array.isArray(el.props.children) ? el.props.children : [el.props.children];
}

// ---------------------------------------------------------------------------
// Rendering per severity
// ---------------------------------------------------------------------------

describe('Banner -- severity rendering', () => {
  it('renders with info severity', () => {
    const el = Banner({ severity: 'info', message: 'Info message' });
    expect(el).not.toBeNull();
  });

  it('renders with warning severity', () => {
    const el = Banner({ severity: 'warning', message: 'Warning message' });
    expect(el).not.toBeNull();
  });

  it('renders with alert severity', () => {
    const el = Banner({ severity: 'alert', message: 'Alert message' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Role attribute per severity
// ---------------------------------------------------------------------------

describe('Banner -- role attribute', () => {
  it('has role="status" for info severity', () => {
    const el = Banner({ severity: 'info', message: 'Info' });
    expect(el.props.role).toBe('status');
  });

  it('has role="status" for warning severity', () => {
    const el = Banner({ severity: 'warning', message: 'Warning' });
    expect(el.props.role).toBe('status');
  });

  it('has role="alert" for alert severity', () => {
    const el = Banner({ severity: 'alert', message: 'Alert' });
    expect(el.props.role).toBe('alert');
  });
});

// ---------------------------------------------------------------------------
// aria-live attribute
// ---------------------------------------------------------------------------

describe('Banner -- aria-live', () => {
  it('has aria-live="polite" for info severity', () => {
    const el = Banner({ severity: 'info', message: 'Info' });
    expect(el.props['aria-live']).toBe('polite');
  });

  it('has aria-live="polite" for warning severity', () => {
    const el = Banner({ severity: 'warning', message: 'Warning' });
    expect(el.props['aria-live']).toBe('polite');
  });

  it('has aria-live="polite" for alert severity', () => {
    const el = Banner({ severity: 'alert', message: 'Alert' });
    expect(el.props['aria-live']).toBe('polite');
  });
});

// ---------------------------------------------------------------------------
// Message rendering
// ---------------------------------------------------------------------------

describe('Banner -- message', () => {
  it('renders the message text', () => {
    const el = Banner({ severity: 'info', message: 'Hello world' });
    const children = getChildren(el);
    // children[1] is the message pane
    const messagePane = children[1];
    expect(messagePane).not.toBeNull();
    const msgChildren = Array.isArray(messagePane.props.children)
      ? messagePane.props.children
      : [messagePane.props.children];
    expect(msgChildren).toContain('Hello world');
  });

  it('renders an empty string message', () => {
    const el = Banner({ severity: 'info', message: '' });
    expect(el).not.toBeNull();
  });

  it('renders a long message', () => {
    const longMsg = 'A'.repeat(500);
    const el = Banner({ severity: 'warning', message: longMsg });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Dismiss button
// ---------------------------------------------------------------------------

describe('Banner -- dismiss button', () => {
  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn).not.toBeNull();
    expect(dismissBtn.type).toBe('button');
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const lastChild = children[children.length - 1];
    expect(lastChild).toBeNull();
  });

  it('dismiss button has aria-label="Dismiss banner"', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn.props['aria-label']).toBe('Dismiss banner');
  });

  it('dismiss button has onClick handler', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(typeof dismissBtn.props.onClick).toBe('function');
  });

  it('dismiss button displays the x character', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    const btnChildren = Array.isArray(dismissBtn.props.children)
      ? dismissBtn.props.children
      : [dismissBtn.props.children];
    expect(btnChildren).toContain('\u00D7');
  });

  it('dismiss button size is 28x28', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn.props.style.width).toBe('28px');
    expect(dismissBtn.props.style.height).toBe('28px');
  });

  it('dismiss button has circular shape', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn.props.style.borderRadius).toBe('50%');
  });

  it('dismiss button has subtle gray background', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss });
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn.props.style.backgroundColor).toBe('#f1f5f9');
  });
});

// ---------------------------------------------------------------------------
// Default icons per severity
// ---------------------------------------------------------------------------

describe('Banner -- default icons', () => {
  it('renders default icon for info severity (SVG)', () => {
    const el = Banner({ severity: 'info', message: 'Info' });
    const children = getChildren(el);
    const iconPane = children[0];
    const iconChildren = Array.isArray(iconPane.props.children)
      ? iconPane.props.children
      : [iconPane.props.children];
    const svg = iconChildren[0];
    expect(svg).not.toBeNull();
    expect(svg.type).toBe('svg');
  });

  it('renders default icon for warning severity (SVG)', () => {
    const el = Banner({ severity: 'warning', message: 'Warning' });
    const children = getChildren(el);
    const iconPane = children[0];
    const iconChildren = Array.isArray(iconPane.props.children)
      ? iconPane.props.children
      : [iconPane.props.children];
    const svg = iconChildren[0];
    expect(svg).not.toBeNull();
    expect(svg.type).toBe('svg');
  });

  it('renders default icon for alert severity (SVG)', () => {
    const el = Banner({ severity: 'alert', message: 'Alert' });
    const children = getChildren(el);
    const iconPane = children[0];
    const iconChildren = Array.isArray(iconPane.props.children)
      ? iconPane.props.children
      : [iconPane.props.children];
    const svg = iconChildren[0];
    expect(svg).not.toBeNull();
    expect(svg.type).toBe('svg');
  });
});

// ---------------------------------------------------------------------------
// Custom icon
// ---------------------------------------------------------------------------

describe('Banner -- custom icon', () => {
  it('renders custom icon when provided', () => {
    const customIcon = 'CUSTOM';
    const el = Banner({ severity: 'info', message: 'Test', icon: customIcon });
    const children = getChildren(el);
    const iconPane = children[0];
    const iconChildren = Array.isArray(iconPane.props.children)
      ? iconPane.props.children
      : [iconPane.props.children];
    expect(iconChildren).toContain('CUSTOM');
  });

  it('custom icon overrides default SVG icon', () => {
    const el = Banner({ severity: 'alert', message: 'Test', icon: '!!' });
    const children = getChildren(el);
    const iconPane = children[0];
    const iconChildren = Array.isArray(iconPane.props.children)
      ? iconPane.props.children
      : [iconPane.props.children];
    expect(iconChildren).toContain('!!');
  });
});

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

describe('Banner -- visibility', () => {
  it('returns null when visible is false', () => {
    const el = Banner({ severity: 'info', message: 'Hidden', visible: false });
    expect(el).toBeNull();
  });

  it('renders when visible is true', () => {
    const el = Banner({ severity: 'info', message: 'Shown', visible: true });
    expect(el).not.toBeNull();
  });

  it('renders by default when visible is not specified', () => {
    const el = Banner({ severity: 'info', message: 'Default visible' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Background color per severity
// ---------------------------------------------------------------------------

describe('Banner -- background color', () => {
  it('info severity has #eff6ff background', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.backgroundColor).toBe('#eff6ff');
  });

  it('warning severity has #fffbeb background', () => {
    const el = Banner({ severity: 'warning', message: 'Test' });
    expect(el.props.style.backgroundColor).toBe('#fffbeb');
  });

  it('alert severity has #fef2f2 background', () => {
    const el = Banner({ severity: 'alert', message: 'Test' });
    expect(el.props.style.backgroundColor).toBe('#fef2f2');
  });
});

// ---------------------------------------------------------------------------
// Border color per severity
// ---------------------------------------------------------------------------

describe('Banner -- border color', () => {
  it('info severity has #3b82f6 border', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.borderBottom).toBe('1px solid #3b82f6');
  });

  it('warning severity has #f59e0b border', () => {
    const el = Banner({ severity: 'warning', message: 'Test' });
    expect(el.props.style.borderBottom).toBe('1px solid #f59e0b');
  });

  it('alert severity has #ef4444 border', () => {
    const el = Banner({ severity: 'alert', message: 'Test' });
    expect(el.props.style.borderBottom).toBe('1px solid #ef4444');
  });
});

// ---------------------------------------------------------------------------
// Icon pane dimensions
// ---------------------------------------------------------------------------

describe('Banner -- icon pane', () => {
  it('icon pane is 50x50', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const iconPane = children[0];
    expect(iconPane.props.style.width).toBe('50px');
    expect(iconPane.props.style.height).toBe('50px');
  });

  it('icon pane has flex-shrink 0', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const iconPane = children[0];
    expect(iconPane.props.style.flexShrink).toBe('0');
  });

  it('icon pane centers its content', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const iconPane = children[0];
    expect(iconPane.props.style.display).toBe('flex');
    expect(iconPane.props.style.alignItems).toBe('center');
    expect(iconPane.props.style.justifyContent).toBe('center');
  });
});

// ---------------------------------------------------------------------------
// Message pane styling
// ---------------------------------------------------------------------------

describe('Banner -- message pane', () => {
  it('message pane has font-size 14px', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.fontSize).toBe('14px');
  });

  it('message pane has flex: 1', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.flex).toBe('1');
  });

  it('message pane has horizontal padding of 16px', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.padding).toBe('0 16px');
  });

  it('info message has dark blue text color', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.color).toBe('#2563eb');
  });

  it('warning message has dark amber text color', () => {
    const el = Banner({ severity: 'warning', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.color).toBe('#92400e');
  });

  it('alert message has dark red text color', () => {
    const el = Banner({ severity: 'alert', message: 'Test' });
    const children = getChildren(el);
    const messagePane = children[1];
    expect(messagePane.props.style.color).toBe('#991b1b');
  });
});

// ---------------------------------------------------------------------------
// Container layout
// ---------------------------------------------------------------------------

describe('Banner -- container layout', () => {
  it('has position: relative (not fixed or absolute)', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.position).toBe('relative');
  });

  it('uses flexbox layout', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.display).toBe('flex');
  });

  it('aligns items center', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.alignItems).toBe('center');
  });

  it('has full width', () => {
    const el = Banner({ severity: 'info', message: 'Test' });
    expect(el.props.style.width).toBe('100%');
  });
});

// ---------------------------------------------------------------------------
// Edge cases / sad path
// ---------------------------------------------------------------------------

describe('Banner -- edge cases', () => {
  it('handles unknown severity gracefully (falls back to info theme)', () => {
    const el = Banner({ severity: 'custom' as any, message: 'Unknown' });
    expect(el).not.toBeNull();
    expect(el.props.style.backgroundColor).toBe('#eff6ff');
  });

  it('renders with onDismiss and visible=true', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss, visible: true });
    expect(el).not.toBeNull();
    const children = getChildren(el);
    const dismissBtn = children[children.length - 1];
    expect(dismissBtn).not.toBeNull();
  });

  it('returns null with onDismiss and visible=false', () => {
    const onDismiss = vi.fn();
    const el = Banner({ severity: 'info', message: 'Test', onDismiss, visible: false });
    expect(el).toBeNull();
  });
});
