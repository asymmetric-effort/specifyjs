# Carousel

**Category:** Media  
**Path:** `components/media/carousel`

## Overview

Image/content carousel slider.
Supports left/right arrows, dot indicators, auto-advance timer,
CSS transform slide animation, keyboard navigation (left/right arrows),
touch swipe via pointer events, and fade/slide animation modes.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `CarouselItem[]` (required) | Carousel items |
| `autoPlay` | `boolean` | Enable auto-advance |
| `interval` | `number` | Auto-advance interval in ms (default: 5000) |
| `showDots` | `boolean` | Show dot indicators (default: true) |
| `showArrows` | `boolean` | Show prev/next arrows (default: true) |
| `loop` | `boolean` | Loop from last to first (default: true) |
| `animation` | `'slide' | 'fade'` | Transition animation type |
| `onChange` | `(index: number) => void` | Called when the active index changes |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
