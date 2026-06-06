# AdSense

A Google AdSense advertisement component that injects the AdSense script and renders an ad unit. Supports a test mode that displays a placeholder instead of real ads.

## Import

```ts
import { AdSense } from '@aspect/ad/adsense';
import type { AdSenseProps } from '@aspect/ad/adsense';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `client` | `string` | required | Google AdSense client ID (e.g., `'ca-pub-1234567890'`) |
| `slot` | `string` | required | Ad slot ID |
| `format` | `'auto' \| 'rectangle' \| 'horizontal' \| 'vertical'` | `'auto'` | Ad format |
| `responsive` | `boolean` | `false` | Enable responsive sizing (sets `data-full-width-responsive="true"`) |
| `width` | `number` | `undefined` | Custom width in pixels |
| `height` | `number` | `undefined` | Custom height in pixels |
| `className` | `string` | `undefined` | CSS class name |
| `testMode` | `boolean` | `false` | Show a placeholder instead of real ads |

## Usage

```ts
import { createElement } from 'specifyjs';
import { AdSense } from '@aspect/ad/adsense';

// Basic ad unit
const ad = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
});

// Responsive ad
const responsive = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  format: 'auto',
  responsive: true,
});

// Fixed-size rectangle ad
const rectangle = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  format: 'rectangle',
  width: 300,
  height: 250,
});

// Test mode placeholder (for development)
const testAd = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  testMode: true,
  width: 728,
  height: 90,
});
```

## Features

- Injects the AdSense loader script into `<head>` once per client ID.
- Pushes to `window.adsbygoogle` to request an ad fill for each slot.
- Production mode renders an `<ins class="adsbygoogle">` element with the required data attributes.
- Test mode renders a styled placeholder `<div>` with a dashed border showing the slot ID, useful during development.
- Supports four ad formats: auto, rectangle, horizontal, and vertical.
- Custom width and height override the default ad sizing.
- Responsive mode adds `data-full-width-responsive="true"` for full-width ad units.
