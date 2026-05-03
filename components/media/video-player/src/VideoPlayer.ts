// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VideoPlayer -- Simple video player wrapper with optional custom controls.
 *
 * When controls=true (default), renders custom play/pause, seekable progress bar,
 * time display, volume slider, and fullscreen button as SpecifyJS elements
 * overlaid on the native video element.
 */

import { createElement } from '../../../../core/src/index';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
} from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoPlayerProps {
  /** Video source URL */
  src: string;
  /** Poster image URL */
  poster?: string;
  /** Width (CSS value or number) */
  width?: string | number;
  /** Height (CSS value or number) */
  height?: string | number;
  /** Auto-play video */
  autoPlay?: boolean;
  /** Loop playback */
  loop?: boolean;
  /** Muted */
  muted?: boolean;
  /** Show custom controls (default: true) */
  controls?: boolean;
  /** Play callback */
  onPlay?: () => void;
  /** Pause callback */
  onPause?: () => void;
  /** Ended callback */
  onEnded?: () => void;
  /** Time update callback */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VideoPlayer(props: VideoPlayerProps) {
  const showControls = props.controls !== false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(props.muted ? 0 : 1);
  const [muted, setMuted] = useState(!!props.muted);
  const [showControlBar, setShowControlBar] = useState(true);

  const cssWidth = typeof props.width === 'number' ? `${props.width}px` : (props.width ?? '100%');
  const cssHeight = typeof props.height === 'number' ? `${props.height}px` : (props.height ?? 'auto');

  // -----------------------------------------------------------------------
  // Video event wiring
  // -----------------------------------------------------------------------

  useEffect(() => {
    const v = videoRef.current as unknown as HTMLVideoElement;
    if (!v) return;

    const onPlay = () => {
      setPlaying(true);
      if (props.onPlay) props.onPlay();
    };
    const onPause = () => {
      setPlaying(false);
      if (props.onPause) props.onPause();
    };
    const onEnded = () => {
      setPlaying(false);
      if (props.onEnded) props.onEnded();
    };
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      setDuration(v.duration);
      if (props.onTimeUpdate) props.onTimeUpdate(v.currentTime, v.duration);
    };
    const onLoadedMetadata = () => {
      setDuration(v.duration);
    };

    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [props.onPlay, props.onPause, props.onEnded, props.onTimeUpdate]);

  // -----------------------------------------------------------------------
  // Control handlers
  // -----------------------------------------------------------------------

  const togglePlay = useCallback(() => {
    const v = videoRef.current as unknown as HTMLVideoElement;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const seek = useCallback((e: MouseEvent) => {
    const v = videoRef.current as unknown as HTMLVideoElement;
    if (!v || !isFinite(v.duration)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  const changeVolume = useCallback((e: Event) => {
    const v = videoRef.current as unknown as HTMLVideoElement;
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current as unknown as HTMLVideoElement;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }, []);

  // -----------------------------------------------------------------------
  // Native-only (controls=false)
  // -----------------------------------------------------------------------

  if (!showControls) {
    return createElement('video', {
      ref: videoRef,
      src: props.src,
      poster: props.poster,
      controls: true,
      autoplay: props.autoPlay ? true : undefined,
      loop: props.loop ? true : undefined,
      muted: props.muted ? true : undefined,
      style: { width: cssWidth, height: cssHeight, display: 'block' },
    });
  }

  // -----------------------------------------------------------------------
  // Custom controls
  // -----------------------------------------------------------------------

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const btnStyle: Record<string, string> = {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    lineHeight: '1',
  };

  const controlBar = createElement(
    'div',
    {
      style: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        opacity: showControlBar ? '1' : '0',
        transition: 'opacity 0.3s',
      },
    },
    // Play/Pause
    createElement('button', { 'aria-label': playing ? 'Pause' : 'Play', onclick: togglePlay, style: btnStyle }, playing ? '\u23F8' : '\u25B6'),
    // Progress bar
    createElement(
      'div',
      {
        onclick: seek,
        style: {
          flex: '1',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
        },
      },
      createElement('div', {
        style: {
          width: `${progressPct}%`,
          height: '100%',
          backgroundColor: '#3b82f6',
          borderRadius: '2px',
          transition: 'width 0.1s linear',
        },
      }),
    ),
    // Time display
    createElement(
      'span',
      { style: { color: '#ffffff', fontSize: '12px', whiteSpace: 'nowrap', fontFamily: 'monospace' } },
      `${formatTime(currentTime)} / ${formatTime(duration)}`,
    ),
    // Volume slider
    createElement('input', {
      type: 'range',
      min: '0',
      max: '1',
      step: '0.05',
      value: String(muted ? 0 : volume),
      oninput: changeVolume,
      'aria-label': 'Volume',
      style: { width: '60px', cursor: 'pointer' },
    }),
    // Fullscreen
    createElement('button', { 'aria-label': 'Fullscreen', onclick: toggleFullscreen, style: btnStyle }, '\u26F6'),
  );

  return createElement(
    'div',
    {
      style: {
        position: 'relative',
        width: cssWidth,
        height: cssHeight,
        backgroundColor: '#000',
        overflow: 'hidden',
      },
      onmouseenter: () => setShowControlBar(true),
      onmouseleave: () => { if (playing) setShowControlBar(false); },
    },
    createElement('video', {
      ref: videoRef,
      src: props.src,
      poster: props.poster,
      autoplay: props.autoPlay ? true : undefined,
      loop: props.loop ? true : undefined,
      muted: props.muted ? true : undefined,
      playsinline: true,
      onclick: togglePlay,
      style: { width: '100%', height: '100%', display: 'block', objectFit: 'contain' },
    }),
    controlBar,
  );
}
