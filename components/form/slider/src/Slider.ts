// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Slider — Custom range slider with support for single and dual handles,
 * marks/ticks, and value display.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useRef, useCallback, useEffect, useMemo, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper } from '../../wrapper/src/FormFieldWrapper';

export interface SliderMark {
  value: number;
  label: string;
}

export interface SliderProps {
  /** Current value (number for single, [number, number] for range) */
  value: number | [number, number];
  /** Change handler */
  onChange: (value: number | [number, number]) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Show current value label above thumb */
  showValue?: boolean;
  /** Show tick marks at each step */
  showTicks?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Named marks along the track */
  marks?: SliderMark[];
  /** Enable range mode (dual handles) */
  range?: boolean;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** HTML id for the input element */
  id?: string;
}

export function Slider(props: SliderProps) {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? autoId;
  const {
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    showValue = false,
    showTicks = false,
    disabled = false,
    marks,
    range = false,
    label,
    error,
  } = props;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | 'single' | 'start' | 'end'>(null);

  const values: [number, number] = useMemo(() => {
    if (range && Array.isArray(value)) return value as [number, number];
    const v = typeof value === 'number' ? value : 0;
    return [v, v];
  }, [value, range]);

  const clamp = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min;
    return Math.max(min, Math.min(max, snapped));
  };

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  const getValueFromEvent = useCallback(
    (e: MouseEvent) => {
      if (!trackRef.current) return min;
      const rect = (trackRef.current as HTMLElement).getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return clamp(min + pct * (max - min));
    },
    [min, max, step],
  );

  const handleMouseDown = useCallback(
    (handleType: 'single' | 'start' | 'end') => (e: MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setDragging(handleType);
    },
    [disabled],
  );

  const handleTrackClick = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;
      const newVal = getValueFromEvent(e);
      if (range) {
        const distStart = Math.abs(newVal - values[0]);
        const distEnd = Math.abs(newVal - values[1]);
        if (distStart <= distEnd) {
          onChange([clamp(newVal), values[1]]);
        } else {
          onChange([values[0], clamp(newVal)]);
        }
      } else {
        onChange(clamp(newVal));
      }
    },
    [disabled, getValueFromEvent, range, values, onChange, min, max, step],
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newVal = getValueFromEvent(e);
      if (dragging === 'single') {
        onChange(clamp(newVal));
      } else if (dragging === 'start') {
        onChange([Math.min(clamp(newVal), values[1]), values[1]]);
      } else if (dragging === 'end') {
        onChange([values[0], Math.max(values[0], clamp(newVal))]);
      }
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, getValueFromEvent, values, onChange, min, max, step]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      let delta = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
      else return;
      e.preventDefault();
      if (!range) {
        onChange(clamp((typeof value === 'number' ? value : 0) + delta));
      }
    },
    [disabled, step, range, value, onChange, min, max],
  );

  const trackStyle: Record<string, string> = {
    position: 'relative',
    width: '100%',
    height: '6px',
    backgroundColor: '#e5e7eb',
    borderRadius: '3px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const fillLeft = range ? toPercent(values[0]) : 0;
  const fillRight = range ? toPercent(values[1]) : toPercent(values[0]);

  const fillStyle: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: `${fillLeft}%`,
    width: `${fillRight - fillLeft}%`,
    height: '100%',
    backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
    borderRadius: '3px',
  };

  const thumbLabel = (handleType: 'single' | 'start' | 'end') => {
    if (label) {
      if (handleType === 'start') return `${label} minimum`;
      if (handleType === 'end') return `${label} maximum`;
      return label;
    }
    if (handleType === 'start') return 'Minimum value';
    if (handleType === 'end') return 'Maximum value';
    return 'Value';
  };

  const createThumb = (pct: number, handleType: 'single' | 'start' | 'end', val: number) => {
    const thumbStyle: Record<string, string> = {
      position: 'absolute',
      top: '50%',
      left: `${pct}%`,
      transform: 'translate(-50%, -50%)',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: `2px solid ${disabled ? '#9ca3af' : '#3b82f6'}`,
      cursor: disabled ? 'not-allowed' : 'grab',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      zIndex: '2',
    };

    const valueLabelStyle: Record<string, string> = {
      position: 'absolute',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1f2937',
      color: '#ffffff',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '11px',
      whiteSpace: 'nowrap',
    };

    return createElement(
      'div',
      {
        id: handleType === 'single' || handleType === 'start' ? inputId : undefined,
        style: thumbStyle,
        onMouseDown: handleMouseDown(handleType),
        role: 'slider',
        'aria-valuenow': String(val),
        'aria-valuemin': String(min),
        'aria-valuemax': String(max),
        'aria-label': thumbLabel(handleType),
        tabIndex: disabled ? -1 : 0,
        onKeyDown: handleKeyDown,
      },
      showValue
        ? createElement('div', { style: valueLabelStyle }, String(val))
        : null,
    );
  };

  const tickElements: unknown[] = [];
  if (showTicks) {
    for (let v = min; v <= max; v += step) {
      tickElements.push(
        createElement('div', {
          key: `tick-${v}`,
          style: {
            position: 'absolute',
            top: '10px',
            left: `${toPercent(v)}%`,
            width: '1px',
            height: '6px',
            backgroundColor: '#d1d5db',
            transform: 'translateX(-50%)',
          },
        }),
      );
    }
  }

  const markElements: unknown[] = [];
  if (marks) {
    for (const mark of marks) {
      markElements.push(
        createElement(
          'div',
          {
            key: `mark-${mark.value}`,
            style: {
              position: 'absolute',
              top: '18px',
              left: `${toPercent(mark.value)}%`,
              transform: 'translateX(-50%)',
              fontSize: '11px',
              color: '#6b7280',
              whiteSpace: 'nowrap',
            },
          },
          mark.label,
        ),
      );
    }
  }

  const containerStyle: Record<string, string> = {
    paddingTop: showValue ? '28px' : '8px',
    paddingBottom: marks || showTicks ? '28px' : '8px',
    opacity: disabled ? '0.6' : '1',
  };

  const thumbs: unknown[] = [];
  if (range) {
    thumbs.push(createThumb(toPercent(values[0]), 'start', values[0]));
    thumbs.push(createThumb(toPercent(values[1]), 'end', values[1]));
  } else {
    thumbs.push(createThumb(toPercent(values[0]), 'single', values[0]));
  }

  return createElement(FormFieldWrapper, {
    label,
    error,
    htmlFor: inputId,
  },
    createElement(
      'div',
      { style: containerStyle },
      createElement(
        'div',
        {
          ref: trackRef,
          style: trackStyle,
          onClick: handleTrackClick,
        },
        createElement('div', { style: fillStyle }),
        ...thumbs,
        ...tickElements,
        ...markElements,
      ),
    ),
  );
}
