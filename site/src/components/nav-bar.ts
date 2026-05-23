// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement, FeatureGate, useFeatureFlags } from 'specifyjs';
import { Link } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';

function SpecifyLogo() {
  return createElement(
    'svg',
    {
      width: '22',
      height: '22',
      viewBox: '0 0 64 64',
      style: { flexShrink: '0' },
    },
    createElement('rect', { x: '2', y: '2', width: '60', height: '60', rx: '12', fill: '#3b82f6' }),
    // T-square
    createElement('line', { x1: '14', y1: '14', x2: '50', y2: '50', stroke: 'white', 'stroke-width': '5', 'stroke-linecap': 'round' }),
    createElement('line', { x1: '10', y1: '18', x2: '22', y2: '10', stroke: 'white', 'stroke-width': '5', 'stroke-linecap': 'round' }),
    // Ruler ticks
    createElement('line', { x1: '22', y1: '20', x2: '24', y2: '22', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
    createElement('line', { x1: '30', y1: '28', x2: '32', y2: '30', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
    createElement('line', { x1: '38', y1: '36', x2: '40', y2: '38', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
    // Compass
    createElement('circle', { cx: '42', cy: '16', r: '2', fill: 'white' }),
    createElement('line', { x1: '42', y1: '16', x2: '50', y2: '36', stroke: 'white', 'stroke-width': '3', 'stroke-linecap': 'round' }),
    createElement('line', { x1: '42', y1: '16', x2: '36', y2: '38', stroke: 'white', 'stroke-width': '3', 'stroke-linecap': 'round' }),
    createElement('circle', { cx: '43', cy: '30', r: '6', fill: 'none', stroke: 'white', 'stroke-width': '1.5' }),
  );
}

function DarkModeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    // Mark as manually overridden so the system listener doesn't fight
    document.documentElement.setAttribute('data-theme-manual', 'true');
  };

  return createElement(
    'button',
    {
      className: 'dark-mode-toggle',
      onClick: toggle,
      title: dark ? 'Switch to light mode' : 'Switch to dark mode',
    },
    dark ? '\u2600\ufe0f' : '\ud83c\udf19',
  );
}

const navItems: { to: string; label: string; flag?: string; exact?: boolean }[] = [
  { to: '/', label: 'Home', exact: true },
  { to: '/components', label: 'Components' },
  { to: '/concurrent', label: 'Concurrent', flag: 'concurrent-rendering' },
  { to: '/api', label: 'API' },
  { to: '/docs', label: 'Docs' },
  { to: '/getting-started', label: 'Get Started', flag: 'getting-started' },
  { to: '/featureflags', label: 'Flags', flag: 'feature-flags-demo' },
];

function GatedNavLinks({ mobileOpen }: { mobileOpen?: boolean }) {
  const { isEnabled } = useFeatureFlags();
  const linkClass = 'nav-links' + (mobileOpen ? ' nav-links--open' : '');
  return createElement(
    'div',
    { className: linkClass },
    ...navItems
      .filter((item) => !item.flag || isEnabled(item.flag))
      .map((item) =>
        createElement(
          Link,
          { to: item.to, className: 'nav-link', activeClassName: 'active', exact: item.exact },
          item.label,
        ),
      ),
  );
}

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = useCallback(
    ((..._args: unknown[]) => setMobileOpen((prev: boolean) => !prev)) as (
      ...args: unknown[]
    ) => unknown,
    [],
  );

  return createElement(
    'nav',
    { className: 'nav-bar' },
    createElement(
      'div',
      { className: 'nav-bar-inner' },
      createElement(
        Link,
        { to: '/', className: 'nav-logo', exact: true },
        createElement(SpecifyLogo, null),
        createElement('span', null,
          createElement('span', { style: { color: 'var(--color-primary)' } }, 'Specify'),
          createElement('span', { style: { color: 'var(--color-text)' } }, 'JS'),
        ),
      ),
      createElement(GatedNavLinks, { mobileOpen }),
      createElement(FeatureGate, { flag: 'dark-mode', fallback: null },
        createElement(DarkModeToggle, null),
      ),
      createElement(
        'button',
        {
          className: 'nav-hamburger',
          onClick: toggleMenu,
          'aria-label': mobileOpen ? 'Close menu' : 'Open menu',
          'aria-expanded': String(mobileOpen),
        },
        mobileOpen ? '\u2715' : '\u2630',
      ),
    ),
  );
}
