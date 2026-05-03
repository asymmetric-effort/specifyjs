# VideoPlayer

**Category:** Media  
**Path:** `components/media/video-player`

## Overview

Simple video player wrapper with optional custom controls.
When controls=true (default), renders custom play/pause, seekable progress bar,
time display, volume slider, and fullscreen button as SpecifyJS elements
overlaid on the native video element.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` (required) | Video source URL |
| `poster` | `string` | Poster image URL |
| `width` | `string | number` | Width (CSS value or number) |
| `height` | `string | number` | Height (CSS value or number) |
| `autoPlay` | `boolean` | Auto-play video |
| `loop` | `boolean` | Loop playback |
| `muted` | `boolean` | Muted |
| `controls` | `boolean` | Show custom controls (default: true) |
| `onPlay` | `() => void` | Play callback |
| `onPause` | `() => void` | Pause callback |
| `onEnded` | `() => void` | Ended callback |
| `onTimeUpdate` | `(currentTime: number, duration: number) => void` | Time update callback |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
