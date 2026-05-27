// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Button — A configurable, accessible button component.
 * Supports variants (primary, secondary, outline, ghost, danger),
 * sizes (sm, md, lg), disabled state, and full-width mode.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

export interface ButtonProps {
  /** Button label / children */
  children?: unknown;
  /** Click handler */
  onClick?: (e: Event) => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Custom className */
  className?: string;
  /** Custom inline style overrides */
  style?: Record<string, string>;
  /** Accessible label (when children is an icon) */
  ariaLabel?: string;
  /** Whether button is in active/toggled state */
  active?: boolean;
}

const SIZE_MAP: Record<string, { padding: string; fontSize: string; borderRadius: string }> = {
  sm: { padding: '3px 10px', fontSize: '12px', borderRadius: '4px' },
  md: { padding: '6px 14px', fontSize: '13px', borderRadius: '6px' },
  lg: { padding: '8px 20px', fontSize: '15px', borderRadius: '6px' },
};

const VARIANT_COLORS: Record<string, { bg: string; color: string; border: string; hoverBg?: string }> = {
  primary: { bg: '#3b82f6', color: 'white', border: '#3b82f6' },
  secondary: { bg: '#f8fafc', color: '#0f172a', border: '#d1d5db' },
  outline: { bg: 'transparent', color: '#0f172a', border: '#d1d5db' },
  ghost: { bg: 'transparent', color: '#0f172a', border: 'transparent' },
  danger: { bg: '#ef4444', color: 'white', border: '#ef4444' },
};

export function Button(props: ButtonProps) {
  const {
    children,
    onClick,
    variant = 'secondary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    type = 'button',
    className,
    style: customStyle,
    ariaLabel,
    active = false,
  } = props;

  const computedStyle = useMemo(() => {
    const sizeStyle = SIZE_MAP[size] ?? SIZE_MAP.md;
    const variantStyle = VARIANT_COLORS[variant] ?? VARIANT_COLORS.secondary;

    const base: Record<string, string> = {
      padding: sizeStyle.padding,
      fontSize: sizeStyle.fontSize,
      borderRadius: sizeStyle.borderRadius,
      border: `1px solid ${variantStyle.border}`,
      backgroundColor: active ? '#3b82f6' : variantStyle.bg,
      color: active ? 'white' : variantStyle.color,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'inherit',
      lineHeight: '1.4',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      transition: 'background-color 0.15s, opacity 0.15s',
      opacity: disabled ? '0.5' : '1',
    };

    if (fullWidth) {
      base.width = '100%';
    }

    if (customStyle) {
      Object.assign(base, customStyle);
    }

    return base;
  }, [variant, size, disabled, fullWidth, active, customStyle]);

  return createElement('button', {
    type,
    onClick: disabled ? undefined : onClick,
    disabled,
    className,
    style: computedStyle,
    'aria-label': ariaLabel,
    'aria-pressed': active ? 'true' : undefined,
  }, children);
}
