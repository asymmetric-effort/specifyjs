// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordDiagram } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleMatrix = [
  [0, 10, 20],
  [10, 0, 30],
  [20, 30, 0],
];

const sampleLabels = ['Alpha', 'Beta', 'Gamma'];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('ChordDiagram — happy path', () => {
  it('renders with matrix and labels', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, title: 'Connections' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, width: 800, height: 800 });
    expect(el).not.toBeNull();
  });

  it('renders with showLabels disabled', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with showValues enabled', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, showValues: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom ribbonOpacity', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, ribbonOpacity: 0.8 });
    expect(el).not.toBeNull();
  });

  it('renders with custom padAngle', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, padAngle: 0.1 });
    expect(el).not.toBeNull();
  });

  it('renders with custom innerRadiusRatio', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, innerRadiusRatio: 0.8 });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = ChordDiagram({
      matrix: sampleMatrix,
      labels: sampleLabels,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('ChordDiagram — sad path', () => {
  it('handles empty matrix', () => {
    const el = ChordDiagram({ matrix: [], labels: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles empty labels with non-empty matrix', () => {
    const el = ChordDiagram({ matrix: [[10]], labels: [] });
    expect(el).not.toBeNull();
  });

  it('handles all-zero matrix', () => {
    const el = ChordDiagram({
      matrix: [[0, 0], [0, 0]],
      labels: ['A', 'B'],
    });
    expect(el).not.toBeNull();
  });

  it('handles single-element matrix', () => {
    const el = ChordDiagram({
      matrix: [[5]],
      labels: ['Solo'],
    });
    expect(el).not.toBeNull();
  });

  it('handles matrix with self-loops', () => {
    const el = ChordDiagram({
      matrix: [[10, 5], [5, 20]],
      labels: ['A', 'B'],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('ChordDiagram — defaults', () => {
  it('uses default width and height', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="img"', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels });
    expect(el.props['aria-label']).toBe('Chord diagram');
  });

  it('uses title as aria-label when provided', () => {
    const el = ChordDiagram({ matrix: sampleMatrix, labels: sampleLabels, title: 'Trade' });
    expect(el.props['aria-label']).toBe('Trade');
  });

  it('shows empty state aria-label for empty data', () => {
    const el = ChordDiagram({ matrix: [], labels: [] });
    expect(el.props['aria-label']).toBe('Empty chord diagram');
  });
});
