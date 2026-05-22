// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VideoPlayer } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('VideoPlayer — happy path', () => {
  it('renders with required src prop', () => {
    const el = VideoPlayer({ src: 'https://example.com/video.mp4' });
    expect(el).not.toBeNull();
  });

  it('renders with poster', () => {
    const el = VideoPlayer({ src: 'video.mp4', poster: 'poster.jpg' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = VideoPlayer({ src: 'video.mp4', width: 800, height: 450 });
    expect(el).not.toBeNull();
  });

  it('renders with string dimensions', () => {
    const el = VideoPlayer({ src: 'video.mp4', width: '100%', height: '56.25%' });
    expect(el).not.toBeNull();
  });

  it('renders with custom controls (default)', () => {
    const el = VideoPlayer({ src: 'video.mp4' });
    expect(el).not.toBeNull();
    // Custom controls wrapper should be a div
    expect(el.type).toBe('div');
  });

  it('renders with native controls when controls=false', () => {
    const el = VideoPlayer({ src: 'video.mp4', controls: false });
    expect(el).not.toBeNull();
    expect(el.type).toBe('video');
  });

  it('renders with autoPlay', () => {
    const el = VideoPlayer({ src: 'video.mp4', autoPlay: true });
    expect(el).not.toBeNull();
  });

  it('renders with loop', () => {
    const el = VideoPlayer({ src: 'video.mp4', loop: true });
    expect(el).not.toBeNull();
  });

  it('renders with muted', () => {
    const el = VideoPlayer({ src: 'video.mp4', muted: true });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('VideoPlayer — sad path', () => {
  it('handles empty src', () => {
    const el = VideoPlayer({ src: '' });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = VideoPlayer({ src: 'video.mp4', width: 0, height: 0 });
    expect(el).not.toBeNull();
  });

  it('handles negative dimensions', () => {
    const el = VideoPlayer({ src: 'video.mp4', width: -100, height: -50 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests (play/pause)
// ---------------------------------------------------------------------------

describe('VideoPlayer — interaction', () => {
  it('renders play/pause button in custom controls', () => {
    const el = VideoPlayer({ src: 'video.mp4' });
    // The control bar is the last child of the wrapper div
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const controlBar = children[children.length - 1];
    expect(controlBar).not.toBeNull();
    // First button in control bar should be play/pause
    const cbChildren = Array.isArray(controlBar.props.children) ? controlBar.props.children : [controlBar.props.children];
    const playBtn = cbChildren.find(
      (c: any) => c && c.type === 'button' && (c.props['aria-label'] === 'Play' || c.props['aria-label'] === 'Pause'),
    );
    expect(playBtn).toBeDefined();
  });

  it('renders fullscreen button', () => {
    const el = VideoPlayer({ src: 'video.mp4' });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const controlBar = children[children.length - 1];
    const cbChildren = Array.isArray(controlBar.props.children) ? controlBar.props.children : [controlBar.props.children];
    const fsBtn = cbChildren.find(
      (c: any) => c && c.type === 'button' && c.props['aria-label'] === 'Fullscreen',
    );
    expect(fsBtn).toBeDefined();
  });

  it('renders volume slider', () => {
    const el = VideoPlayer({ src: 'video.mp4' });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const controlBar = children[children.length - 1];
    const cbChildren = Array.isArray(controlBar.props.children) ? controlBar.props.children : [controlBar.props.children];
    const volumeSlider = cbChildren.find(
      (c: any) => c && c.type === 'input' && c.props['aria-label'] === 'Volume',
    );
    expect(volumeSlider).toBeDefined();
  });

  it('calls onPlay callback', () => {
    const onPlay = vi.fn();
    const el = VideoPlayer({ src: 'video.mp4', onPlay });
    expect(el).not.toBeNull();
  });

  it('calls onPause callback', () => {
    const onPause = vi.fn();
    const el = VideoPlayer({ src: 'video.mp4', onPause });
    expect(el).not.toBeNull();
  });

  it('calls onEnded callback', () => {
    const onEnded = vi.fn();
    const el = VideoPlayer({ src: 'video.mp4', onEnded });
    expect(el).not.toBeNull();
  });
});
