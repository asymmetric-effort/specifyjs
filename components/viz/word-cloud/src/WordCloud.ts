// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * WordCloud — A SpecifyJS component that renders word clouds as SVG.
 *
 * Supports:
 *  - Font size proportional to word weight
 *  - Spiral placement algorithm (archimedean or rectangular) to avoid overlaps
 *  - Configurable rotation angles
 *  - Custom color palettes
 *  - Configurable padding between words
 *  - Proper ARIA attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 *
 * Note: Since SVG text measurement is not available without a DOM, this
 * component uses character-count-based width estimation. Placement is
 * deterministic for the same input.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface WordDatum {
  text: string;
  weight: number;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface WordCloudProps {
  /** Array of words with weights */
  words: WordDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Minimum font size in px (default: 10) */
  minFontSize?: number;
  /** Maximum font size in px (default: 64) */
  maxFontSize?: number;
  /** Font family (default: 'sans-serif') */
  fontFamily?: string;
  /** Color palette for words without explicit color */
  colors?: string[];
  /** Allowed rotation angles in degrees (default: [0, -45, 45, 90]) */
  rotations?: number[];
  /** Padding between words in px (default: 4) */
  padding?: number;
  /** Spiral type for placement (default: 'archimedean') */
  spiral?: 'archimedean' | 'rectangular';
  /** Chart title */
  title?: string;
}

// -- Defaults -----------------------------------------------------------------

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

const DEFAULT_ROTATIONS = [0, -45, 45, 90];

// -- Placement helpers --------------------------------------------------------

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Estimate the bounding box of a word at a given font size and rotation.
 * Uses ~0.6 * fontSize as average character width for sans-serif fonts.
 */
function estimateBBox(
  text: string,
  fontSize: number,
  rotation: number,
  cx: number,
  cy: number,
): BBox {
  const charWidth = fontSize * 0.6;
  const textWidth = text.length * charWidth;
  const textHeight = fontSize;
  const rad = (rotation * Math.PI) / 180;
  const cosA = Math.abs(Math.cos(rad));
  const sinA = Math.abs(Math.sin(rad));
  const w = textWidth * cosA + textHeight * sinA;
  const h = textWidth * sinA + textHeight * cosA;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Check whether two bounding boxes overlap. */
function bboxOverlap(a: BBox, b: BBox): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

/** Check whether a bbox is within the canvas. */
function bboxInBounds(box: BBox, width: number, height: number): boolean {
  return box.x >= 0 && box.y >= 0 && box.x + box.w <= width && box.y + box.h <= height;
}

/**
 * Simple deterministic hash for seeding rotation selection.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// -- Component ----------------------------------------------------------------

export function WordCloud(props: WordCloudProps) {
  const {
    words = [],
    width = 600,
    height = 400,
    minFontSize = 10,
    maxFontSize = 64,
    fontFamily = 'sans-serif',
    colors = DEFAULT_COLORS,
    rotations = DEFAULT_ROTATIONS,
    padding = 4,
    spiral = 'archimedean',
    title,
  } = props;

  const placements = useMemo(() => {
    if (words.length === 0) return [];

    // Sort words by weight descending — heaviest placed first
    const sorted = words
      .map((w, idx) => ({ ...w, originalIndex: idx }))
      .filter((w) => w.text.length > 0 && w.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    if (sorted.length === 0) return [];

    // Compute font size scale
    const minW = sorted[sorted.length - 1]!.weight;
    const maxW = sorted[0]!.weight;
    const weightRange = maxW - minW;

    function fontSize(weight: number): number {
      if (weightRange === 0) return (minFontSize + maxFontSize) / 2;
      const t = (weight - minW) / weightRange;
      return minFontSize + t * (maxFontSize - minFontSize);
    }

    const placed: {
      text: string;
      x: number;
      y: number;
      fontSize: number;
      rotation: number;
      color: string;
      bbox: BBox;
    }[] = [];

    const centerX = width / 2;
    const centerY = height / 2;

    for (let wi = 0; wi < sorted.length; wi++) {
      const word = sorted[wi]!;
      const fs = fontSize(word.weight);
      const rot = rotations[simpleHash(word.text) % rotations.length]!;
      const color = word.color ?? colors[wi % colors.length]!;

      let foundPlace = false;

      // Spiral outward to find a non-overlapping position
      const maxSteps = 500;
      const spiralStep = spiral === 'archimedean' ? 4 : 5;

      for (let step = 0; step < maxSteps; step++) {
        let dx: number;
        let dy: number;

        if (spiral === 'archimedean') {
          const angle = step * 0.1;
          const r = spiralStep * angle;
          dx = r * Math.cos(angle);
          dy = r * Math.sin(angle);
        } else {
          // Rectangular spiral
          const side = Math.floor(step / 4) + 1;
          const dir = step % 4;
          const progress = (step % 4 === 0 ? 0 : step) * spiralStep;
          switch (dir) {
            case 0: dx = side * spiralStep * 4; dy = progress; break;
            case 1: dx = -progress; dy = side * spiralStep * 4; break;
            case 2: dx = -side * spiralStep * 4; dy = -progress; break;
            default: dx = progress; dy = -side * spiralStep * 4; break;
          }
        }

        const testX = centerX + dx;
        const testY = centerY + dy;
        const bbox = estimateBBox(word.text, fs, rot, testX, testY);

        // Add padding
        const paddedBBox: BBox = {
          x: bbox.x - padding,
          y: bbox.y - padding,
          w: bbox.w + padding * 2,
          h: bbox.h + padding * 2,
        };

        if (!bboxInBounds(paddedBBox, width, height)) continue;

        let overlaps = false;
        for (const p of placed) {
          if (bboxOverlap(paddedBBox, p.bbox)) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          placed.push({
            text: word.text,
            x: testX,
            y: testY,
            fontSize: fs,
            rotation: rot,
            color,
            bbox: paddedBBox,
          });
          foundPlace = true;
          break;
        }
      }

      // If no place found, skip this word (graceful degradation)
      if (!foundPlace) continue;
    }

    return placed;
  }, [words, width, height, minFontSize, maxFontSize, colors, rotations, padding, spiral]);

  // ---- Empty state ----------------------------------------------------------

  if (words.length === 0 || placements.length === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Word cloud — no data',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': fontFamily,
          fill: 'currentColor',
          opacity: '0.6',
        },
        'No words to display.',
      ),
    );
  }

  // ---- Build word elements --------------------------------------------------

  const wordElements: ReturnType<typeof createElement>[] = [];

  if (title) {
    wordElements.push(
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: '24',
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': fontFamily,
          fill: 'currentColor',
        },
        title,
      ),
    );
  }

  for (let i = 0; i < placements.length; i++) {
    const p = placements[i]!;
    const transform = p.rotation !== 0
      ? `translate(${p.x},${p.y}) rotate(${p.rotation})`
      : `translate(${p.x},${p.y})`;

    wordElements.push(
      createElement(
        'text',
        {
          key: `word-${i}`,
          transform,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': String(p.fontSize),
          'font-family': fontFamily,
          fill: p.color,
          'aria-label': p.text,
        },
        p.text,
      ),
    );
  }

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Word cloud',
      style: { fontFamily },
    },
    ...wordElements,
  );
}
