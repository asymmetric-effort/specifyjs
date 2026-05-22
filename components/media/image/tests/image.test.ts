// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Image } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Image — happy path', () => {
  it('renders with required src prop', () => {
    const el = Image({ src: 'https://example.com/photo.jpg' });
    expect(el).not.toBeNull();
  });

  it('renders with alt text', () => {
    const el = Image({ src: 'photo.jpg', alt: 'A photo' });
    expect(el).not.toBeNull();
  });

  it('renders with width and height', () => {
    const el = Image({ src: 'photo.jpg', width: 300, height: 200 });
    expect(el).not.toBeNull();
  });

  it('renders with string dimensions', () => {
    const el = Image({ src: 'photo.jpg', width: '100%', height: 'auto' });
    expect(el).not.toBeNull();
  });

  it('renders with lazy loading enabled by default', () => {
    const el = Image({ src: 'photo.jpg' });
    expect(el).not.toBeNull();
  });

  it('renders with lazy loading disabled', () => {
    const el = Image({ src: 'photo.jpg', lazy: false });
    expect(el).not.toBeNull();
  });

  it('renders with skeleton placeholder', () => {
    const el = Image({ src: 'photo.jpg', placeholder: 'skeleton' });
    expect(el).not.toBeNull();
  });

  it('renders with blur placeholder', () => {
    const el = Image({ src: 'photo.jpg', placeholder: 'blur' });
    expect(el).not.toBeNull();
  });

  it('renders with caption', () => {
    const el = Image({ src: 'photo.jpg', caption: 'A beautiful sunset' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('figure');
  });

  it('renders with object-fit and border-radius', () => {
    const el = Image({ src: 'photo.jpg', objectFit: 'cover', borderRadius: '8px' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Image — sad path', () => {
  it('renders with empty src', () => {
    const el = Image({ src: '' });
    expect(el).not.toBeNull();
  });

  it('handles missing alt gracefully', () => {
    const el = Image({ src: 'photo.jpg' });
    expect(el).not.toBeNull();
  });

  it('handles fallback string URL', () => {
    const el = Image({ src: 'broken.jpg', fallback: 'fallback.jpg' });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = Image({ src: 'photo.jpg', width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('Image — interaction', () => {
  it('renders figure wrapper when caption is provided', () => {
    const el = Image({ src: 'photo.jpg', caption: 'Caption text' });
    expect(el.type).toBe('figure');
  });

  it('renders div wrapper when no caption', () => {
    const el = Image({ src: 'photo.jpg' });
    expect(el.type).toBe('div');
  });

  it('renders with fallback element', () => {
    const el = Image({ src: 'broken.jpg', fallback: 'placeholder.png' });
    expect(el).not.toBeNull();
  });
});
