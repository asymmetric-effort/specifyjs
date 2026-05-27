// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Avatar — User avatar with image, initials fallback, colored circle,
 * and optional online/offline status indicator dot.
 */

import { createElement } from 'specifyjs';
import { useState, useMemo } from 'specifyjs/hooks';

export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** User's name (used to generate initials fallback) */
  name?: string;
  /** Size preset or pixel number */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Shape of the avatar */
  shape?: 'circle' | 'square';
  /** Background color for initials/fallback */
  fallbackColor?: string;
  /** Online status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
  /** Position of the status dot */
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// ── Size mapping ────────────────────────────────────────────────────────

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function resolveSize(size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number): number {
  if (size == null) return sizeMap.md;
  if (typeof size === 'number') return size;
  return sizeMap[size] ?? sizeMap.md;
}

// ── Initials ────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ── Deterministic color from name ───────────────────────────────────────

const palette = [
  '#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316',
  '#ec4899', '#14b8a6', '#6366f1', '#eab308', '#06b6d4',
];

function colorFromName(name?: string): string {
  if (!name) return '#9ca3af';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

// ── Status colors ───────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  online: '#22c55e',
  offline: '#9ca3af',
  busy: '#ef4444',
  away: '#eab308',
};

// ── Status position offsets ─────────────────────────────────────────────

function statusPositionStyle(
  pos: string,
  dotSize: number,
): Record<string, string> {
  const offset = `${-dotSize / 4}px`;
  switch (pos) {
    case 'top-left':
      return { top: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
    case 'top-right':
    default:
      return { top: offset, right: offset };
  }
}

// ── Component ───────────────────────────────────────────────────────────

export function Avatar(props: AvatarProps) {
  const {
    src,
    alt,
    name,
    size,
    shape = 'circle',
    fallbackColor,
    status,
    statusPosition = 'bottom-right',
  } = props;

  const [imgError, setImgError] = useState(false);
  const px = resolveSize(size);
  const borderRadius = shape === 'circle' ? '50%' : `${Math.round(px * 0.15)}px`;
  const bgColor = fallbackColor ?? colorFromName(name);
  const fontSize = `${Math.round(px * 0.4)}px`;

  // Base container style
  const containerStyle: Record<string, string> = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${px}px`,
    height: `${px}px`,
    borderRadius,
    overflow: 'hidden',
    flexShrink: '0',
  };

  // Determine content
  let content: unknown;

  if (src && !imgError) {
    content = createElement('img', {
      src,
      alt: alt ?? name ?? 'avatar',
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      },
      onError: () => setImgError(true),
    });
  } else {
    // Initials fallback
    const initials = getInitials(name);
    content = createElement('span', {
      style: {
        fontSize,
        fontWeight: '600',
        color: '#fff',
        lineHeight: '1',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      'aria-hidden': 'true',
    }, initials);
  }

  // Build avatar element
  const avatarEl = createElement('div', {
    style: {
      ...containerStyle,
      backgroundColor: src && !imgError ? 'transparent' : bgColor,
    },
    role: 'img',
    'aria-label': alt ?? name ?? 'avatar',
  }, content);

  // If no status, return avatar directly
  if (!status) return avatarEl;

  // Status dot
  const dotSize = Math.max(8, Math.round(px * 0.25));
  const dotStyle: Record<string, string> = {
    position: 'absolute',
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    borderRadius: '50%',
    backgroundColor: statusColors[status] ?? statusColors.offline,
    border: '2px solid #fff',
    boxSizing: 'border-box',
    ...statusPositionStyle(statusPosition, dotSize),
  };

  return createElement('div', {
    style: {
      position: 'relative',
      display: 'inline-flex',
      width: `${px}px`,
      height: `${px}px`,
      flexShrink: '0',
    },
  },
    avatarEl,
    createElement('span', {
      style: dotStyle,
      'aria-label': status,
    }),
  );
}
