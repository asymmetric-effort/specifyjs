# Avatar

**Category:** Data Display  
**Path:** `components/data/avatar`

## Overview

User avatar with image, initials fallback, colored circle,
and optional online/offline status indicator dot.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Image source URL |
| `alt` | `string` | Alt text for image |
| `name` | `string` | User's name (used to generate initials fallback) |
| `size` | `'xs' | 'sm' | 'md' | 'lg' | 'xl' | number` | Size preset or pixel number |
| `shape` | `'circle' | 'square'` | Shape of the avatar |
| `fallbackColor` | `string` | Background color for initials/fallback |
| `status` | `'online' | 'offline' | 'busy' | 'away'` | Online status indicator |
| `statusPosition` | `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'` | Position of the status dot |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
