// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Accordion — Expandable/collapsible section navigation component.
 *
 * Builds on NavWrapper to provide accessible accordion behavior with
 * configurable single or multiple expansion, animation, keyboard
 * navigation, and custom styling.
 */

import { createElement, type FunctionComponent } from 'specifyjs';
import { useState, useCallback, useMemo } from 'specifyjs/hooks';
import { NavWrapper, useHover } from '../../wrapper/src/NavWrapper';
import type { NavWrapperStyle } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface AccordionSection {
  /** Unique identifier for the section */
  id: string;
  /** Text displayed in the section header */
  header: string;
  /** Content rendered when the section is expanded */
  content: unknown;
  /** Optional icon displayed in the header */
  icon?: string;
  /** When true, section cannot be toggled */
  disabled?: boolean;
}

export interface AccordionHeaderStyle {
  padding?: string;
  backgroundColor?: string;
  hoverBackground?: string;
  color?: string;
  fontWeight?: string;
  fontSize?: string;
  borderBottom?: string;
}

export interface AccordionContentStyle {
  padding?: string;
  backgroundColor?: string;
  borderBottom?: string;
}

export interface AccordionProps {
  /** Array of sections to render */
  sections: AccordionSection[];
  /** IDs of sections that should be expanded on initial render */
  defaultExpanded?: string[];
  /** Allow multiple sections to be open at the same time (default: false) */
  allowMultiple?: boolean;
  /** Styling for section headers */
  headerStyle?: AccordionHeaderStyle;
  /** Styling for section content panels */
  contentStyle?: AccordionContentStyle;
  /** Styling passed through to the NavWrapper container */
  wrapperStyle?: NavWrapperStyle;
  /** Icon shown on collapsed sections (default: '+') */
  expandIcon?: string;
  /** Icon shown on expanded sections (default: '\u2212') */
  collapseIcon?: string;
  /** Position of the expand/collapse icon (default: 'right') */
  iconPosition?: 'left' | 'right';
  /** Enable smooth open/close animation via max-height transition (default: true) */
  animated?: boolean;
  /** Callback fired with the array of currently expanded section IDs */
  onChange?: (expandedIds: string[]) => void;
}

// -- Internal header component ------------------------------------------------

interface SectionHeaderProps {
  section: AccordionSection;
  expanded: boolean;
  onToggle: () => void;
  headerStyle: AccordionHeaderStyle;
  expandIcon: string;
  collapseIcon: string;
  iconPosition: 'left' | 'right';
}

function SectionHeader(props: SectionHeaderProps) {
  const {
    section,
    expanded,
    onToggle,
    headerStyle: hs,
    expandIcon,
    collapseIcon,
    iconPosition,
  } = props;

  const { hover, onMouseEnter, onMouseLeave } = useHover();

  const disabled = section.disabled === true;

  const style: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    boxSizing: 'border-box',
    padding: hs.padding ?? '12px 16px',
    backgroundColor: disabled
      ? '#f9fafb'
      : hover
        ? (hs.hoverBackground ?? '#f3f4f6')
        : (hs.backgroundColor ?? 'transparent'),
    color: disabled ? '#9ca3af' : (hs.color ?? 'inherit'),
    fontWeight: hs.fontWeight ?? '600',
    fontSize: hs.fontSize ?? 'inherit',
    border: 'none',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    font: 'inherit',
    textAlign: 'left',
    transition: 'background-color 0.15s',
    ...(hs.borderBottom ? { borderBottom: hs.borderBottom } : {}),
  };

  if (iconPosition === 'left') {
    style.flexDirection = 'row';
  }

  const handleKeyDown = useCallback(
    (e: Event) => {
      const ke = e as KeyboardEvent;
      if (disabled) return;
      if (ke.key === 'Enter' || ke.key === ' ') {
        ke.preventDefault();
        onToggle();
      }
    },
    [disabled, onToggle],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      onToggle();
    }
  }, [disabled, onToggle]);

  const iconText = expanded ? collapseIcon : expandIcon;

  const iconSpan = createElement(
    'span',
    {
      'aria-hidden': 'true',
      style: {
        display: 'inline-block',
        transition: 'transform 0.2s ease',
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: '0',
        marginLeft: iconPosition === 'right' ? 'auto' : '0',
        marginRight: iconPosition === 'left' ? '8px' : '0',
        paddingLeft: iconPosition === 'right' ? '8px' : '0',
      },
    },
    iconText,
  );

  const headerContent = section.icon
    ? createElement(
        'span',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        createElement('span', { 'aria-hidden': 'true' }, section.icon),
        section.header,
      )
    : section.header;

  const children =
    iconPosition === 'left'
      ? [iconSpan, headerContent]
      : [headerContent, iconSpan];

  return createElement(
    'button',
    {
      id: `accordion-header-${section.id}`,
      role: 'button',
      'aria-expanded': String(expanded),
      'aria-controls': `accordion-panel-${section.id}`,
      'aria-disabled': disabled ? 'true' : undefined,
      'data-section-id': section.id,
      tabIndex: disabled ? -1 : 0,
      style,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onMouseEnter,
      onMouseLeave,
    },
    ...children,
  );
}

// -- Internal content panel component ----------------------------------------

interface SectionContentProps {
  section: AccordionSection;
  expanded: boolean;
  contentStyle: AccordionContentStyle;
  animated: boolean;
}

function SectionContent(props: SectionContentProps) {
  const { section, expanded, contentStyle: cs, animated } = props;

  const style: Record<string, string> = {
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...(animated
      ? {
          maxHeight: expanded ? '2000px' : '0',
          transition: 'max-height 0.3s ease',
        }
      : {
          display: expanded ? 'block' : 'none',
        }),
  };

  const innerStyle: Record<string, string> = {
    padding: cs.padding ?? '12px 16px',
    backgroundColor: cs.backgroundColor ?? 'transparent',
    ...(cs.borderBottom ? { borderBottom: cs.borderBottom } : {}),
  };

  return createElement(
    'div',
    {
      id: `accordion-panel-${section.id}`,
      role: 'region',
      'aria-labelledby': `accordion-header-${section.id}`,
      'aria-hidden': String(!expanded),
      'data-section-content': section.id,
      style,
    },
    createElement('div', { style: innerStyle }, section.content),
  );
}

// -- Accordion component -----------------------------------------------------

export function Accordion(props: AccordionProps) {
  const {
    sections,
    defaultExpanded,
    allowMultiple = false,
    headerStyle = {},
    contentStyle = {},
    wrapperStyle,
    expandIcon = '+',
    collapseIcon = '\u2212',
    iconPosition = 'right',
    animated = true,
    onChange,
  } = props;

  const [expandedIds, setExpandedIds] = useState<string[]>(
    () => defaultExpanded ?? [],
  );

  const toggle = useCallback(
    (id: string) => {
      setExpandedIds((prev: string[]) => {
        const isExpanded = prev.includes(id);
        let next: string[];

        if (isExpanded) {
          next = prev.filter((x: string) => x !== id);
        } else if (allowMultiple) {
          next = [...prev, id];
        } else {
          next = [id];
        }

        if (onChange) {
          onChange(next);
        }

        return next;
      });
    },
    [allowMultiple, onChange],
  );

  const sectionElements = useMemo(() => {
    return sections.map((section: AccordionSection) => {
      const expanded = expandedIds.includes(section.id);

      const header = createElement(SectionHeader as unknown as FunctionComponent, {
        key: `header-${section.id}`,
        section,
        expanded,
        onToggle: () => toggle(section.id),
        headerStyle,
        expandIcon,
        collapseIcon,
        iconPosition,
      });

      const content = createElement(SectionContent as unknown as FunctionComponent, {
        key: `content-${section.id}`,
        section,
        expanded,
        contentStyle,
        animated,
      });

      return createElement(
        'div',
        {
          key: section.id,
          'data-accordion-section': section.id,
          style: { width: '100%' },
        },
        header,
        content,
      );
    });
  }, [
    sections,
    expandedIds,
    headerStyle,
    contentStyle,
    expandIcon,
    collapseIcon,
    iconPosition,
    animated,
    toggle,
  ]);

  return createElement(
    NavWrapper,
    {
      role: 'region',
      ariaLabel: 'Accordion',
      styling: wrapperStyle,
      keyboardNav: true,
    },
    ...sectionElements,
  );
}
