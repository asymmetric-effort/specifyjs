// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAriaCompliance } from '../../../src/shared/aria-warnings';
import { resetWarnings } from '../../../src/shared/warnings';

describe('checkAriaCompliance', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetWarnings();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  // --- button ---

  it('warns for <button> without text content or aria-label', () => {
    checkAriaCompliance('button', {});
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<button> without text content or aria-label'),
    );
  });

  it('does not warn for <button> with aria-label', () => {
    checkAriaCompliance('button', { 'aria-label': 'Close' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for <button> with aria-labelledby', () => {
    checkAriaCompliance('button', { 'aria-labelledby': 'label-id' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for <button> with children', () => {
    checkAriaCompliance('button', { children: 'Click me' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- img ---

  it('warns for <img> without alt attribute', () => {
    checkAriaCompliance('img', { src: 'photo.jpg' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('<img> without alt attribute'));
  });

  it('does not warn for <img> with alt=""', () => {
    checkAriaCompliance('img', { src: 'photo.jpg', alt: '' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for <img> with descriptive alt', () => {
    checkAriaCompliance('img', { src: 'photo.jpg', alt: 'A sunset' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- input/select/textarea ---

  it('warns for <input> without aria-label, aria-labelledby, or id', () => {
    checkAriaCompliance('input', { type: 'text' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('<input> without aria-label'));
  });

  it('does not warn for <input> with aria-label', () => {
    checkAriaCompliance('input', { type: 'text', 'aria-label': 'Name' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for <input> with id', () => {
    checkAriaCompliance('input', { type: 'text', id: 'name-input' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns for <select> without accessible name', () => {
    checkAriaCompliance('select', {});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('<select> without aria-label'));
  });

  it('warns for <textarea> without accessible name', () => {
    checkAriaCompliance('textarea', {});
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('<textarea> without aria-label'));
  });

  // --- clickable div/span ---

  it('warns for <div> with onClick but no role', () => {
    checkAriaCompliance('div', { onClick: () => {} });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<div> with onClick but no role attribute'),
    );
  });

  it('does not warn for <div> with onClick and role="button"', () => {
    checkAriaCompliance('div', { onClick: () => {}, role: 'button', tabIndex: 0 });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns for <span> with onClick but no role', () => {
    checkAriaCompliance('span', { onClick: () => {} });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<span> with onClick but no role attribute'),
    );
  });

  // --- role="button" without tabIndex ---

  it('warns for element with role="button" but no tabIndex', () => {
    checkAriaCompliance('div', { role: 'button' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('role="button" but no tabIndex'));
  });

  it('does not warn for <button> with role="button" and no tabIndex', () => {
    checkAriaCompliance('button', { role: 'button', children: 'Click' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for element with role="button" and tabIndex', () => {
    checkAriaCompliance('div', { role: 'button', tabIndex: 0 });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- role="dialog" ---

  it('warns for role="dialog" without aria-label or aria-labelledby', () => {
    checkAriaCompliance('div', { role: 'dialog' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('role="dialog" needs aria-label or aria-labelledby'),
    );
  });

  it('does not warn for role="dialog" with aria-label', () => {
    checkAriaCompliance('div', { role: 'dialog', 'aria-label': 'Settings' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for role="dialog" with aria-labelledby', () => {
    checkAriaCompliance('div', { role: 'dialog', 'aria-labelledby': 'dialog-title' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- <a target="_blank"> ---

  it('warns for <a target="_blank"> without rel', () => {
    checkAriaCompliance('a', { href: 'https://example.com', target: '_blank' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('<a target="_blank"> without rel attribute'),
    );
  });

  it('does not warn for <a target="_blank"> with rel', () => {
    checkAriaCompliance('a', {
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- role="tablist" ---

  it('warns for role="tablist" without aria-label or aria-labelledby', () => {
    checkAriaCompliance('div', { role: 'tablist' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('role="tablist" needs aria-label or aria-labelledby'),
    );
  });

  it('does not warn for role="tablist" with aria-label', () => {
    checkAriaCompliance('div', { role: 'tablist', 'aria-label': 'Navigation tabs' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- production mode ---

  it('does not warn in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      checkAriaCompliance('img', { src: 'photo.jpg' });
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
