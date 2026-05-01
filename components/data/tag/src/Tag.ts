// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Tag — Rounded pill/chip element with optional remove button, icon,
 * and click interaction.
 */

import { createElement } from '../../../../core/src/index';

export interface TagProps {
  /** Tag label text */
  label: string;
  /** Color theme (CSS color or named color) */
  color?: string;
  /** Visual variant */
  variant?: 'solid' | 'outline' | 'subtle';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Show remove/close button */
  removable?: boolean;
  /** Remove button handler */
  onRemove?: () => void;
  /** Leading icon element */
  icon?: unknown;
  /** Click handler (makes tag interactive) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

// ── Color helpers ───────────────────────────────────────────────────────

function resolveColor(color?: string): string {
  return color ?? '#3b82f6';
}

function hexToRgba(hex: string, alpha: number): string {
  // Handle named colors by falling back to a simple mapping
  const named: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    purple: '#a855f7', pink: '#ec4899', orange: '#f97316', gray: '#6b7280',
    indigo: '#6366f1', teal: '#14b8a6', cyan: '#06b6d4',
  };
  const resolved = named[hex] ?? hex;
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(resolved);
  if (match) {
    return `rgba(${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}, ${alpha})`;
  }
  return hex;
}

// ── Sizes ───────────────────────────────────────────────────────────────

const sizes: Record<string, { fontSize: string; padding: string; gap: string }> = {
  sm: { fontSize: '11px', padding: '2px 8px', gap: '4px' },
  md: { fontSize: '13px', padding: '4px 10px', gap: '6px' },
  lg: { fontSize: '15px', padding: '6px 14px', gap: '8px' },
};

// ── Styles ──────────────────────────────────────────────────────────────

function buildTagStyle(
  color: string,
  variant: 'solid' | 'outline' | 'subtle',
  size: 'sm' | 'md' | 'lg',
  clickable: boolean,
  disabled: boolean,
): Record<string, string> {
  const s = sizes[size];

  const base: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap,
    borderRadius: '9999px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: s.fontSize,
    fontWeight: '500',
    padding: s.padding,
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    border: 'none',
    transition: 'opacity 0.15s ease, filter 0.15s ease',
    ...(clickable ? { cursor: 'pointer' } : {}),
    ...(disabled ? { opacity: '0.5', cursor: 'default', pointerEvents: 'none' } : {}),
  };

  switch (variant) {
    case 'solid':
      return { ...base, backgroundColor: color, color: '#fff', border: 'none' };
    case 'outline':
      return { ...base, backgroundColor: 'transparent', color, border: `1px solid ${color}` };
    case 'subtle':
      return { ...base, backgroundColor: hexToRgba(color, 0.12), color, border: 'none' };
    default:
      return base;
  }
}

const removeButtonStyle: Record<string, string> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'none',
  border: 'none',
  padding: '0',
  marginLeft: '2px',
  cursor: 'pointer',
  fontSize: 'inherit',
  lineHeight: '1',
  opacity: '0.7',
  color: 'inherit',
};

// ── Component ───────────────────────────────────────────────────────────

export function Tag(props: TagProps) {
  const {
    label,
    color,
    variant = 'subtle',
    size = 'md',
    removable = false,
    onRemove,
    icon,
    onClick,
    disabled = false,
  } = props;

  const resolvedColor = resolveColor(color);
  const style = buildTagStyle(resolvedColor, variant, size, !!onClick, disabled);

  const children: unknown[] = [];

  if (icon) {
    children.push(
      createElement('span', { key: 'icon', style: { display: 'inline-flex', flexShrink: '0' } }, icon),
    );
  }

  children.push(
    createElement('span', { key: 'label' }, label),
  );

  if (removable) {
    children.push(
      createElement('button', {
        key: 'remove',
        type: 'button',
        style: removeButtonStyle,
        onClick: (e: Event) => {
          e.stopPropagation();
          if (!disabled && onRemove) onRemove();
        },
        'aria-label': `Remove ${label}`,
        disabled,
      }, '\u00D7'),
    );
  }

  return createElement('span', {
    style,
    role: onClick ? 'button' : undefined,
    tabIndex: onClick && !disabled ? '0' : undefined,
    onClick: !disabled && onClick ? onClick : undefined,
    onKeyDown: onClick && !disabled ? (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        onClick();
      }
    } : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
  }, ...children);
}
