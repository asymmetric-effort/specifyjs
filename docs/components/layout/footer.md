# Footer

A three-column footer with left, center, and right content areas. Uses flexbox layout with configurable styling and a max-width inner container.

## Import

```ts
import { Footer } from '@aspect/layout/footer';
import type { FooterProps } from '@aspect/layout/footer';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `unknown` | `undefined` | Content for the left section |
| `center` | `unknown` | `undefined` | Content for the center section |
| `right` | `unknown` | `undefined` | Content for the right section |
| `borderTop` | `string` | `'1px solid var(--color-border, #e2e8f0)'` | Top border style |
| `background` | `string` | `'var(--color-bg, transparent)'` | Background color |
| `color` | `string` | `'var(--color-text-muted, #64748b)'` | Text color |
| `fontSize` | `string` | `'13px'` | Font size |
| `padding` | `string` | `'24px'` | Padding |
| `maxWidth` | `string` | `'1200px'` | Max width for the inner container |
| `className` | `string` | `undefined` | CSS class name |
| `ariaLabel` | `string` | `'Site footer'` | ARIA label for the footer landmark |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Footer } from '@aspect/layout/footer';

// Basic footer
const footer = createElement(Footer, {
  left: createElement('span', null, '\u00A9 2026 My Company'),
  center: createElement('span', null, 'Built with SpecifyJS'),
  right: createElement('a', { href: '/privacy' }, 'Privacy Policy'),
});

// Footer with custom styling
const styled = createElement(Footer, {
  left: 'Copyright 2026',
  center: 'v1.2.3',
  right: 'All rights reserved',
  background: '#1e293b',
  color: '#94a3b8',
  padding: '32px',
  maxWidth: '960px',
});

// Minimal footer
const minimal = createElement(Footer, {
  center: createElement('span', null, 'Powered by SpecifyJS'),
});
```

## Features

- Three-column flexbox layout with equal-width sections (left, center, right).
- Each section has a minimum width of 150px and wraps on narrow screens via `flexWrap: wrap`.
- Sections are text-aligned left, center, and right respectively.
- Inner container is centered with a configurable max width.
- A top margin of 48px provides spacing from preceding content.
- Supports CSS custom properties for theme integration (`--color-border`, `--color-bg`, `--color-text-muted`).

## Accessibility

- Renders as a `<footer>` element with `role="contentinfo"`.
- `aria-label` defaults to `'Site footer'` and can be customized.
