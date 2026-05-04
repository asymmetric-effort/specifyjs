// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Shared props interface for all US state/territory map components.
 */
export interface StateMapProps {
  /** SVG width (default: auto based on aspect ratio) */
  width?: number;
  /** SVG height (default: auto based on aspect ratio) */
  height?: number;
  /** Fill color for the state shape (default: '#3b82f6') */
  fillColor?: string;
  /** Stroke color for the state outline (default: '#ffffff') */
  strokeColor?: string;
  /** Stroke width (default: 1) */
  strokeWidth?: number;
  /** Click handler */
  onClick?: (e: Event) => void;
  /** Mouse enter handler */
  onMouseEnter?: (e: Event) => void;
  /** Mouse leave handler */
  onMouseLeave?: (e: Event) => void;
  /** Accessible title (defaults to full state name) */
  title?: string;
  /** CSS class name */
  className?: string;
}
