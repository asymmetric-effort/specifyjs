# Footer

**Category:** Layout  
**Path:** `components/layout/footer`

## Overview

A three-column footer with left, center, and right content areas.
Usage:
  createElement(Footer, {
    left: createElement('span', null, 'Copyright 2026'),
    center: createElement('span', null, 'Built with SpecifyJS'),
    right: createElement('a', { href: '/privacy' }, 'Privacy'),
  })

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | Content for the left section |
| `center` | `unknown` | Content for the center section |
| `right` | `unknown` | Content for the right section |
| `borderTop` | `string` | Border top style |
| `background` | `string` | Background color |
| `color` | `string` | Text color |
| `fontSize` | `string` | Font size |
| `padding` | `string` | Padding |
| `maxWidth` | `string` | Max width for inner container |
| `className` | `string` | CSS className |
| `ariaLabel` | `string` | ARIA label for the footer landmark |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
