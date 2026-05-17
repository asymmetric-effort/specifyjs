// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DesktopBackground -- Full-area workspace background with configurable
 * color/gradient/image, right-click context menu integration, and click handlers
 * that only fire on direct background clicks (not bubbled from children).
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useMemo } from '../../../../core/src/hooks/index';
import { ContextMenu } from '../../../overlay/context-menu/src/index';
import type { ContextMenuItem } from '../../../overlay/context-menu/src/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DesktopBackgroundProps {
  /** Background color. Default: '#2c001e' (Ubuntu aubergine) */
  backgroundColor?: string;

  /** Background gradient. Overrides backgroundColor if provided. */
  backgroundGradient?: string;

  /** Background image URL. Rendered with cover/center. */
  backgroundImage?: string;

  /** Background image opacity (0-1). Default: 1. */
  backgroundImageOpacity?: number;

  /** Context menu items shown on right-click of the background. */
  contextMenuItems?: ContextMenuItem[];

  /** Called when the background itself is clicked (not a child). */
  onClick?: () => void;

  /** Called when the background is double-clicked. */
  onDoubleClick?: () => void;

  /** Content rendered on top of the background. */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BG_COLOR = '#2c001e';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DesktopBackground(props: DesktopBackgroundProps) {
  const {
    backgroundColor = DEFAULT_BG_COLOR,
    backgroundGradient,
    backgroundImage,
    backgroundImageOpacity = 1,
    contextMenuItems,
    onClick,
    onDoubleClick,
    children,
  } = props;

  // -----------------------------------------------------------------------
  // Event handlers -- only fire when clicking the background itself
  // -----------------------------------------------------------------------

  const handleClick = useCallback((e: Event) => {
    const me = e as MouseEvent;
    if (me.target === me.currentTarget && onClick) {
      onClick();
    }
  }, [onClick]);

  const handleDoubleClick = useCallback((e: Event) => {
    const me = e as MouseEvent;
    if (me.target === me.currentTarget && onDoubleClick) {
      onDoubleClick();
    }
  }, [onDoubleClick]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      cursor: 'default',
      margin: '0',
      padding: '0',
    };

    // Layer 1: background color
    s.backgroundColor = backgroundColor;

    // Layer 2: gradient overrides color
    if (backgroundGradient) {
      s.background = backgroundGradient;
    }

    // Layer 3: image (only when opacity is 1 and no separate overlay needed)
    if (backgroundImage && backgroundImageOpacity >= 1) {
      s.backgroundImage = `url(${backgroundImage})`;
      s.backgroundSize = 'cover';
      s.backgroundPosition = 'center';
    }

    return s;
  }, [backgroundColor, backgroundGradient, backgroundImage, backgroundImageOpacity]);

  // Image overlay style (when opacity < 1)
  const imageOverlayStyle = useMemo<Record<string, string> | null>(() => {
    if (!backgroundImage || backgroundImageOpacity >= 1) return null;
    return {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: String(backgroundImageOpacity),
      pointerEvents: 'none',
      zIndex: '0',
    };
  }, [backgroundImage, backgroundImageOpacity]);

  // Children wrapper style (above the image overlay)
  const childrenWrapperStyle: Record<string, string> = {
    position: 'relative',
    width: '100%',
    height: '100%',
    zIndex: '1',
  };

  // -----------------------------------------------------------------------
  // Build element tree
  // -----------------------------------------------------------------------

  const bgChildren: unknown[] = [];

  // Image overlay (when opacity < 1)
  if (imageOverlayStyle) {
    bgChildren.push(
      createElement('div', {
        className: 'desktop-background__image-overlay',
        style: imageOverlayStyle,
        'aria-hidden': 'true',
      }),
    );
  }

  // Children wrapper
  bgChildren.push(
    createElement(
      'div',
      {
        className: 'desktop-background__content',
        style: childrenWrapperStyle,
      },
      children,
    ),
  );

  // The main background container
  const backgroundEl = createElement(
    'div',
    {
      className: 'desktop-background',
      style: containerStyle,
      onClick: handleClick,
      onDblClick: handleDoubleClick,
      role: 'application',
      'aria-label': 'Desktop workspace',
      'data-theme': 'dark',
    },
    ...bgChildren,
  );

  // Wrap in ContextMenu if items are provided
  if (contextMenuItems && contextMenuItems.length > 0) {
    return createElement(
      ContextMenu as any,
      { items: contextMenuItems },
      backgroundEl,
    );
  }

  return backgroundEl;
}
