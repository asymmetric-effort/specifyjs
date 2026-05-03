# Image

**Category:** Media  
**Path:** `components/media/image`

## Overview

Enhanced image component with lazy loading, placeholder, and fallback.
Handles loading/error states: shows a placeholder while loading and a
fallback element or URL on error. Supports lazy loading via the native
loading="lazy" attribute, object-fit, border-radius, and captions.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` (required) | Image source URL |
| `alt` | `string` | Alt text |
| `width` | `string | number` | Width (CSS value or number) |
| `height` | `string | number` | Height (CSS value or number) |
| `fallback` | `string | unknown` | Fallback URL or element shown on error |
| `placeholder` | `'blur' | 'skeleton' | unknown` | Placeholder shown while loading: 'blur', 'skeleton', or element |
| `lazy` | `boolean` | Enable lazy loading (default: true) |
| `objectFit` | `string` | CSS object-fit value |
| `borderRadius` | `string` | CSS border-radius value |
| `caption` | `string` | Caption text rendered below the image |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
