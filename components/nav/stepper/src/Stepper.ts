// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Stepper — Step wizard indicator component.
 *
 * Renders a sequence of step circles/dots connected by lines, showing
 * completed, active, and pending states. Supports horizontal and vertical
 * orientations, clickable steps, and circle/dot variants.
 */

import { createElement } from 'specifyjs';
import { useCallback } from 'specifyjs/hooks';

// -- Types ------------------------------------------------------------------

export interface StepItem {
  /** Step label */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Optional icon text (emoji or character) shown inside the circle */
  icon?: string;
}

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperVariant = 'circle' | 'dot';

export interface StepperProps {
  /** Array of step definitions */
  steps: StepItem[];
  /** Current active step (0-based index) */
  currentStep: number;
  /** Orientation (default: 'horizontal') */
  orientation?: StepperOrientation;
  /** Called when a step is clicked — receives the step index */
  onChange?: (step: number) => void;
  /** Whether steps are clickable (default: false) */
  clickable?: boolean;
  /** Visual variant (default: 'circle') */
  variant?: StepperVariant;
}

// -- Colors -----------------------------------------------------------------

const COLORS = {
  completed: '#2563eb',
  completedBg: '#2563eb',
  completedText: '#ffffff',
  active: '#2563eb',
  activeBorder: '#2563eb',
  activeText: '#2563eb',
  pending: '#d1d5db',
  pendingText: '#9ca3af',
  line: '#d1d5db',
  lineCompleted: '#2563eb',
  labelActive: '#1f2937',
  labelPending: '#9ca3af',
  descriptionColor: '#6b7280',
};

// -- Component --------------------------------------------------------------

export function Stepper(props: StepperProps) {
  const {
    steps,
    currentStep,
    orientation = 'horizontal',
    onChange,
    clickable = false,
    variant = 'circle',
  } = props;

  const isHorizontal = orientation === 'horizontal';
  const circleSize = variant === 'circle' ? 32 : 12;
  const dotSize = variant === 'dot' ? 12 : 32;

  const handleClick = useCallback(
    (index: number) => {
      if (clickable && onChange) {
        onChange(index);
      }
    },
    [clickable, onChange],
  );

  const getStepState = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const renderIndicator = (index: number, step: StepItem, state: 'completed' | 'active' | 'pending') => {
    const size = variant === 'dot' ? dotSize : circleSize;

    const baseStyle: Record<string, string> = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: variant === 'circle' ? '14px' : '0',
      fontWeight: '600',
      flexShrink: '0',
      transition: 'background-color 0.2s, border-color 0.2s',
    };

    if (state === 'completed') {
      return createElement(
        'div',
        {
          style: {
            ...baseStyle,
            backgroundColor: COLORS.completedBg,
            color: COLORS.completedText,
            border: `2px solid ${COLORS.completed}`,
          },
        },
        variant === 'circle'
          ? (step.icon || '\u2713')
          : null,
      );
    }

    if (state === 'active') {
      return createElement(
        'div',
        {
          style: {
            ...baseStyle,
            backgroundColor: '#ffffff',
            color: COLORS.activeText,
            border: `2px solid ${COLORS.activeBorder}`,
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)',
          },
        },
        variant === 'circle'
          ? (step.icon || String(index + 1))
          : createElement('div', {
              style: {
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: COLORS.active,
              },
            }),
      );
    }

    // pending
    return createElement(
      'div',
      {
        style: {
          ...baseStyle,
          backgroundColor: '#ffffff',
          color: COLORS.pendingText,
          border: `2px solid ${COLORS.pending}`,
        },
      },
      variant === 'circle'
        ? (step.icon || String(index + 1))
        : null,
    );
  };

  const renderConnector = (index: number) => {
    if (index >= steps.length - 1) return null;

    const completed = index < currentStep;
    const lineColor = completed ? COLORS.lineCompleted : COLORS.line;

    if (isHorizontal) {
      return createElement('div', {
        style: {
          flex: '1',
          height: '2px',
          backgroundColor: lineColor,
          margin: `0 8px`,
          alignSelf: 'center',
          transition: 'background-color 0.2s',
        },
      });
    }

    return createElement('div', {
      style: {
        width: '2px',
        flex: '1',
        minHeight: '24px',
        backgroundColor: lineColor,
        marginLeft: `${(variant === 'dot' ? dotSize : circleSize) / 2 - 1}px`,
        transition: 'background-color 0.2s',
      },
    });
  };

  const renderStep = (step: StepItem, index: number) => {
    const state = getStepState(index);
    const isActive = state === 'active';
    const isCompleted = state === 'completed';

    const indicator = renderIndicator(index, step, state);

    const labelStyle: Record<string, string> = {
      fontSize: '13px',
      fontWeight: isActive ? '600' : '400',
      color: isActive || isCompleted ? COLORS.labelActive : COLORS.labelPending,
      marginTop: isHorizontal ? '8px' : '0',
      marginLeft: isHorizontal ? '0' : '12px',
      textAlign: isHorizontal ? 'center' : 'left',
      transition: 'color 0.2s',
    };

    const descriptionStyle: Record<string, string> = {
      fontSize: '11px',
      color: COLORS.descriptionColor,
      marginTop: '2px',
      textAlign: isHorizontal ? 'center' : 'left',
    };

    const labelBlock = createElement(
      'div',
      {
        style: isHorizontal
          ? { display: 'flex', flexDirection: 'column', alignItems: 'center' }
          : { display: 'flex', flexDirection: 'column' },
      },
      createElement('span', { style: labelStyle }, step.label),
      step.description
        ? createElement('span', { style: descriptionStyle }, step.description)
        : null,
    );

    const stepContent = isHorizontal
      ? createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
          indicator,
          labelBlock,
        )
      : createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } },
          indicator,
          labelBlock,
        );

    const stepWrapper = createElement(
      clickable ? 'button' : 'div',
      {
        key: String(index),
        onClick: clickable ? () => handleClick(index) : undefined,
        style: {
          display: 'flex',
          flexDirection: isHorizontal ? 'column' : 'row',
          alignItems: isHorizontal ? 'center' : 'flex-start',
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: clickable ? 'pointer' : 'default',
          fontFamily: 'inherit',
          outline: 'none',
        },
        'aria-current': isActive ? 'step' : undefined,
      },
      stepContent,
    );

    return stepWrapper;
  };

  const elements: unknown[] = [];
  steps.forEach((step, index) => {
    elements.push(renderStep(step, index));
    const connector = renderConnector(index);
    if (connector) elements.push(connector);
  });

  return createElement(
    'div',
    {
      role: 'navigation',
      'aria-label': 'Progress steps',
      style: {
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? 'flex-start' : 'stretch',
        width: '100%',
      },
    },
    ...elements,
  );
}
