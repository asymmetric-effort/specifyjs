// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Toggle — Toggle/switch component with sliding pill animation.
 */

import { createElement } from 'specifyjs';
import { useCallback } from 'specifyjs/hooks';

export interface ToggleProps {
  /** Whether toggle is on */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Label position relative to toggle */
  labelPosition?: 'left' | 'right';
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Track color when on */
  onColor?: string;
  /** Track color when off */
  offColor?: string;
}

const SIZE_MAP = {
  sm: { trackW: 32, trackH: 18, thumbSize: 14, offset: 2 },
  md: { trackW: 44, trackH: 24, thumbSize: 20, offset: 2 },
  lg: { trackW: 56, trackH: 30, thumbSize: 26, offset: 2 },
};

export function Toggle(props: ToggleProps) {
  const {
    checked,
    onChange,
    label,
    labelPosition = 'right',
    disabled = false,
    size = 'md',
    onColor = '#3b82f6',
    offColor = '#d1d5db',
  } = props;

  const dim = SIZE_MAP[size];

  const handleClick = useCallback(() => {
    if (disabled) return;
    onChange(!checked);
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [disabled, checked, onChange],
  );

  const trackStyle: Record<string, string> = {
    width: `${dim.trackW}px`,
    height: `${dim.trackH}px`,
    borderRadius: `${dim.trackH}px`,
    backgroundColor: checked ? onColor : offColor,
    position: 'relative',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    flexShrink: '0',
  };

  const thumbLeft = checked ? dim.trackW - dim.thumbSize - dim.offset : dim.offset;

  const thumbStyle: Record<string, string> = {
    width: `${dim.thumbSize}px`,
    height: `${dim.thumbSize}px`,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: `${dim.offset}px`,
    left: `${thumbLeft}px`,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  const containerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    opacity: disabled ? '0.5' : '1',
    userSelect: 'none',
  };

  const labelEl = label
    ? createElement('span', { style: { fontSize: '14px', color: '#374151' } }, label)
    : null;

  const track = createElement('div', { style: trackStyle }, createElement('div', { style: thumbStyle }));

  const children = labelPosition === 'left' ? [labelEl, track] : [track, labelEl];

  return createElement(
    'div',
    {
      style: containerStyle,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      tabIndex: disabled ? -1 : 0,
      role: 'switch',
      'aria-checked': checked ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : undefined,
      'aria-label': label,
    },
    ...children.filter(Boolean),
  );
}
