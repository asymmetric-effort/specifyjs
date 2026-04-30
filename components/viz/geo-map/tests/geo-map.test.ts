// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeoMap, generateUSMapOutline } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleRegions = [
  { id: 'r1', label: 'Region 1', path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z', value: 50 },
  { id: 'r2', label: 'Region 2', path: 'M 100 0 L 200 0 L 200 100 L 100 100 Z', value: 75 },
];

const sampleMarkers = [
  { lat: 40.7, lon: -74.0, label: 'New York' },
  { lat: 34.0, lon: -118.2, label: 'Los Angeles' },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('GeoMap — happy path', () => {
  it('renders with regions', () => {
    const el = GeoMap({ regions: sampleRegions });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with markers', () => {
    const el = GeoMap({ markers: sampleMarkers });
    expect(el).not.toBeNull();
  });

  it('renders with regions and markers', () => {
    const el = GeoMap({ regions: sampleRegions, markers: sampleMarkers });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = GeoMap({ regions: sampleRegions, title: 'Map' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = GeoMap({ regions: sampleRegions, width: 1000, height: 600 });
    expect(el).not.toBeNull();
  });

  it('renders with mercator projection', () => {
    const el = GeoMap({ markers: sampleMarkers, projection: 'mercator' });
    expect(el).not.toBeNull();
  });

  it('renders with equirectangular projection (default)', () => {
    const el = GeoMap({ markers: sampleMarkers, projection: 'equirectangular' });
    expect(el).not.toBeNull();
  });

  it('renders with showLabels enabled', () => {
    const el = GeoMap({ regions: sampleRegions, showLabels: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom colorScale', () => {
    const el = GeoMap({ regions: sampleRegions, colorScale: ['#fff', '#000'] });
    expect(el).not.toBeNull();
  });

  it('renders with explicit minValue and maxValue', () => {
    const el = GeoMap({ regions: sampleRegions, minValue: 0, maxValue: 100 });
    expect(el).not.toBeNull();
  });

  it('renders with custom border and background', () => {
    const el = GeoMap({
      regions: sampleRegions,
      backgroundColor: '#fff',
      borderColor: '#000',
      borderWidth: 2,
      defaultRegionColor: '#ccc',
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('GeoMap — sad path', () => {
  it('handles empty regions and markers', () => {
    const el = GeoMap({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles regions without values', () => {
    const regions = [
      { id: 'r1', label: 'A', path: 'M 0 0 L 10 10 Z' },
    ];
    const el = GeoMap({ regions });
    expect(el).not.toBeNull();
  });

  it('handles markers without labels', () => {
    const markers = [{ lat: 0, lon: 0 }];
    const el = GeoMap({ markers });
    expect(el).not.toBeNull();
  });

  it('handles regions with explicit color', () => {
    const regions = [
      { id: 'r1', label: 'A', path: 'M 0 0 L 10 10 Z', color: '#ff0000' },
    ];
    const el = GeoMap({ regions });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// generateUSMapOutline tests
// ---------------------------------------------------------------------------

describe('generateUSMapOutline', () => {
  it('returns an array of GeoRegion objects', () => {
    const regions = generateUSMapOutline();
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBe(10);
  });

  it('each region has required fields', () => {
    const regions = generateUSMapOutline();
    for (const region of regions) {
      expect(region.id).toBeTruthy();
      expect(region.label).toBeTruthy();
      expect(region.path).toBeTruthy();
      expect(typeof region.value).toBe('number');
    }
  });

  it('can be used directly with GeoMap', () => {
    const regions = generateUSMapOutline();
    const el = GeoMap({ regions });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('GeoMap — defaults', () => {
  it('uses default width and height', () => {
    const el = GeoMap({ regions: sampleRegions });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="img"', () => {
    const el = GeoMap({ regions: sampleRegions });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = GeoMap({ regions: sampleRegions });
    expect(el.props['aria-label']).toBe('Geographic map');
  });

  it('uses title as aria-label when provided', () => {
    const el = GeoMap({ regions: sampleRegions, title: 'US Map' });
    expect(el.props['aria-label']).toBe('US Map');
  });
});
