# AdSense

**Category:** Advertising  
**Path:** `components/ad/adsense`

## Overview

Google AdSense advertisement component.
Injects the AdSense script and renders an ad unit, or shows a
placeholder in test mode.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `client` | `string` (required) | Google AdSense client ID (e.g., 'ca-pub-1234567890') |
| `slot` | `string` (required) | Ad slot ID |
| `format` | `'auto' | 'rectangle' | 'horizontal' | 'vertical'` | Ad format: 'auto', 'rectangle', 'horizontal', 'vertical' |
| `responsive` | `boolean` | Responsive sizing |
| `width` | `number` | Custom width |
| `height` | `number` | Custom height |
| `className` | `string` | CSS className |
| `testMode` | `boolean` | Test mode (shows placeholder instead of real ads) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
