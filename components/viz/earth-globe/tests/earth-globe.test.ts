// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, fn } from '@asymmetric-effort/nogginlessdom';
import {
  EarthGlobe,
  orthographicProject,
  projectPolygonToPath,
  buildGraticuleLines,
  toRad,
  toDeg,
  COUNTRIES,
} from "../src/index";
import type { EarthGlobeProps, CountryData } from "../src/index";
import {
  installMockDispatcher,
  teardownMockDispatcher,
} from "../../../_test-helpers/mock-dispatcher";

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function findChild(
  el: any,
  predicate: (child: any) => boolean,
): any | undefined {
  const children = el.props?.children ?? el.children ?? [];
  const flat = Array.isArray(children) ? children : [children];
  for (const child of flat) {
    if (!child) continue;
    if (predicate(child)) return child;
    const nested = findChild(child, predicate);
    if (nested) return nested;
  }
  return undefined;
}

function findAllChildren(el: any, predicate: (child: any) => boolean): any[] {
  const results: any[] = [];
  const children = el.props?.children ?? el.children ?? [];
  const flat = Array.isArray(children) ? children : [children];
  for (const child of flat) {
    if (!child) continue;
    if (predicate(child)) results.push(child);
    results.push(...findAllChildren(child, predicate));
  }
  return results;
}

// ---------------------------------------------------------------------------
// Projection math tests
// ---------------------------------------------------------------------------

describe("toRad / toDeg", () => {
  it("converts 0 degrees to 0 radians", () => {
    expect(toRad(0)).toBe(0);
  });

  it("converts 180 degrees to PI radians", () => {
    expect(toRad(180)).toBeCloseTo(Math.PI);
  });

  it("converts 90 degrees to PI/2 radians", () => {
    expect(toRad(90)).toBeCloseTo(Math.PI / 2);
  });

  it("converts negative degrees", () => {
    expect(toRad(-90)).toBeCloseTo(-Math.PI / 2);
  });

  it("toDeg converts PI to 180", () => {
    expect(toDeg(Math.PI)).toBeCloseTo(180);
  });

  it("round-trip conversion", () => {
    expect(toDeg(toRad(45))).toBeCloseTo(45);
    expect(toDeg(toRad(-120))).toBeCloseTo(-120);
  });
});

describe("orthographicProject", () => {
  it("projects center point to origin", () => {
    const result = orthographicProject(0, 0, 0, 0);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.visible).toBe(true);
  });

  it("projects point at center longitude, different lat", () => {
    const result = orthographicProject(0, 45, 0, 0);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeGreaterThan(0);
    expect(result.visible).toBe(true);
  });

  it("marks far-side points as not visible", () => {
    const result = orthographicProject(180, 0, 0, 0);
    expect(result.visible).toBe(false);
  });

  it("marks points at 90 deg offset as on the edge", () => {
    const result = orthographicProject(90, 0, 0, 0);
    // cos(90deg) is essentially 0 due to floating point — borderline visible
    // The exact result depends on floating-point precision
    expect(result.x).toBeCloseTo(1, 5);
  });

  it("marks points just under 90 deg as visible", () => {
    const result = orthographicProject(89, 0, 0, 0);
    expect(result.visible).toBe(true);
  });

  it("handles non-zero center longitude", () => {
    const result = orthographicProject(-95, 38, -95, 38);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.visible).toBe(true);
  });

  it("projects a point east of center correctly", () => {
    const result = orthographicProject(10, 0, 0, 0);
    expect(result.x).toBeGreaterThan(0); // east = positive x
    expect(result.visible).toBe(true);
  });

  it("projects a point west of center correctly", () => {
    const result = orthographicProject(-10, 0, 0, 0);
    expect(result.x).toBeLessThan(0); // west = negative x
    expect(result.visible).toBe(true);
  });

  it("projects a point north of center correctly", () => {
    const result = orthographicProject(0, 10, 0, 0);
    expect(result.y).toBeGreaterThan(0); // north = positive y
    expect(result.visible).toBe(true);
  });

  it("projects a point south of center correctly", () => {
    const result = orthographicProject(0, -10, 0, 0);
    expect(result.y).toBeLessThan(0); // south = negative y
    expect(result.visible).toBe(true);
  });

  it("handles center at the north pole", () => {
    const result = orthographicProject(0, 89, 0, 90);
    expect(result.visible).toBe(true);
  });

  it("handles center at the south pole", () => {
    const result = orthographicProject(0, -89, 0, -90);
    expect(result.visible).toBe(true);
  });

  it("x and y are within [-1, 1] range for visible points", () => {
    for (let lon = -180; lon <= 180; lon += 30) {
      for (let lat = -90; lat <= 90; lat += 30) {
        const result = orthographicProject(lon, lat, 0, 0);
        if (result.visible) {
          expect(result.x).toBeGreaterThanOrEqual(-1.001);
          expect(result.x).toBeLessThanOrEqual(1.001);
          expect(result.y).toBeGreaterThanOrEqual(-1.001);
          expect(result.y).toBeLessThanOrEqual(1.001);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// projectPolygonToPath tests
// ---------------------------------------------------------------------------

describe("projectPolygonToPath", () => {
  it("returns empty string for fewer than 3 points", () => {
    expect(projectPolygonToPath([], 0, 0, 200, 200, 190)).toBe("");
    expect(
      projectPolygonToPath(
        [
          [0, 0],
          [1, 1],
        ],
        0,
        0,
        200,
        200,
        190,
      ),
    ).toBe("");
  });

  it("generates a path string for a visible triangle", () => {
    const triangle: [number, number][] = [
      [0, 10],
      [10, 0],
      [-10, 0],
    ];
    const path = projectPolygonToPath(triangle, 0, 0, 200, 200, 190);
    expect(path).toContain("M");
    expect(path).toContain("L");
    expect(path).toContain("Z");
  });

  it("generates an empty path for entirely hidden polygon", () => {
    const farSide: [number, number][] = [
      [170, 0],
      [175, 5],
      [175, -5],
    ];
    const path = projectPolygonToPath(farSide, 0, 0, 200, 200, 190);
    expect(path).toBe("");
  });

  it("handles partially visible polygon (some points hidden)", () => {
    const partial: [number, number][] = [
      [0, 0],
      [80, 0],
      [100, 0], // hidden
      [120, 0], // hidden
      [-80, 0],
    ];
    const path = projectPolygonToPath(partial, 0, 0, 200, 200, 190);
    // Should still produce some path data
    expect(path.length).toBeGreaterThan(0);
  });

  it("scales output by radius", () => {
    const poly: [number, number][] = [
      [10, 10],
      [20, 0],
      [10, -10],
    ];
    const pathSmall = projectPolygonToPath(poly, 0, 0, 100, 100, 50);
    const pathLarge = projectPolygonToPath(poly, 0, 0, 100, 100, 150);
    // Both should produce valid paths but with different coordinate magnitudes
    expect(pathSmall).toContain("M");
    expect(pathLarge).toContain("M");
    // Parse first M coord from each — larger radius should yield larger offset from center
    const getFirstX = (p: string) =>
      parseFloat(p.split("M")[1]!.split(",")[0]!);
    const smallX = Math.abs(getFirstX(pathSmall) - 100);
    const largeX = Math.abs(getFirstX(pathLarge) - 100);
    expect(largeX).toBeGreaterThan(smallX);
  });
});

// ---------------------------------------------------------------------------
// buildGraticuleLines tests
// ---------------------------------------------------------------------------

describe("buildGraticuleLines", () => {
  it("generates graticule paths", () => {
    const lines = buildGraticuleLines(0, 0, 200, 200, 190, 30);
    expect(lines.length).toBeGreaterThan(0);
  });

  it("generates more lines with smaller step", () => {
    const lines30 = buildGraticuleLines(0, 0, 200, 200, 190, 30);
    const lines15 = buildGraticuleLines(0, 0, 200, 200, 190, 15);
    expect(lines15.length).toBeGreaterThan(lines30.length);
  });

  it("all paths start with M", () => {
    const lines = buildGraticuleLines(0, 0, 200, 200, 190, 30);
    for (const line of lines) {
      expect(line[0]).toBe("M");
    }
  });

  it("generates graticule for non-zero center", () => {
    const lines = buildGraticuleLines(-95, 38, 200, 200, 190, 30);
    expect(lines.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Globe data tests
// ---------------------------------------------------------------------------

describe("COUNTRIES data", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(COUNTRIES)).toBe(true);
    expect(COUNTRIES.length).toBeGreaterThan(10);
  });

  it("each country has id, name, and polygons", () => {
    for (const c of COUNTRIES) {
      expect(typeof c.id).toBe("string");
      expect(c.id.length).toBeGreaterThan(0);
      expect(typeof c.name).toBe("string");
      expect(c.name.length).toBeGreaterThan(0);
      expect(Array.isArray(c.polygons)).toBe(true);
      expect(c.polygons.length).toBeGreaterThan(0);
    }
  });

  it("each polygon ring has at least 3 points", () => {
    for (const c of COUNTRIES) {
      for (const ring of c.polygons) {
        expect(ring.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("coordinate values are valid lat/lon", () => {
    for (const c of COUNTRIES) {
      for (const ring of c.polygons) {
        for (const [lon, lat] of ring) {
          expect(lon).toBeGreaterThanOrEqual(-180);
          expect(lon).toBeLessThanOrEqual(180);
          expect(lat).toBeGreaterThanOrEqual(-90);
          expect(lat).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it("contains major countries", () => {
    const ids = COUNTRIES.map((c) => c.id);
    expect(ids).toContain("USA");
    expect(ids).toContain("CAN");
    expect(ids).toContain("MEX");
    expect(ids).toContain("BRA");
    expect(ids).toContain("GBR");
    expect(ids).toContain("FRA");
    expect(ids).toContain("DEU");
    expect(ids).toContain("RUS");
    expect(ids).toContain("CHN");
    expect(ids).toContain("IND");
    expect(ids).toContain("JPN");
    expect(ids).toContain("AUS");
  });
});

// ---------------------------------------------------------------------------
// EarthGlobe component — happy path
// ---------------------------------------------------------------------------

describe("EarthGlobe — happy path", () => {
  it("renders with defaults", () => {
    const el = EarthGlobe({});
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it('has role="img" and aria-label', () => {
    const el = EarthGlobe({});
    expect(el.props.role).toBe("img");
    expect(el.props["aria-label"]).toBe("Earth Globe");
  });

  it("uses custom title for aria-label", () => {
    const el = EarthGlobe({ title: "World Map" });
    expect(el.props["aria-label"]).toBe("World Map");
  });

  it("renders with custom dimensions", () => {
    const el = EarthGlobe({ width: 600, height: 600 });
    expect(el.props.viewBox).toBe("0 0 600 600");
  });

  it("renders default viewBox of 400x400", () => {
    const el = EarthGlobe({});
    expect(el.props.viewBox).toBe("0 0 400 400");
  });

  it("renders width as 100%", () => {
    const el = EarthGlobe({});
    expect(el.props.width).toBe("100%");
  });

  it("contains an ocean circle", () => {
    const el = EarthGlobe({});
    const ocean = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "#3b82f6",
    );
    expect(ocean).toBeDefined();
  });

  it("uses custom ocean color", () => {
    const el = EarthGlobe({ oceanColor: "#000080" });
    const ocean = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "#000080",
    );
    expect(ocean).toBeDefined();
  });

  it("contains a defs element with clipPath", () => {
    const el = EarthGlobe({});
    const defs = findChild(el, (c: any) => c.type === "defs");
    expect(defs).toBeDefined();
  });

  it("contains graticule group when showGraticule is true", () => {
    const el = EarthGlobe({ showGraticule: true });
    const gratGroup = findChild(
      el,
      (c: any) =>
        c.type === "g" && c.props?.["clip-path"]?.includes("globe-clip"),
    );
    expect(gratGroup).toBeDefined();
  });

  it("contains country paths", () => {
    const el = EarthGlobe({});
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    expect(countryPaths.length).toBeGreaterThan(0);
  });

  it("country paths have aria-label", () => {
    const el = EarthGlobe({});
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    for (const p of countryPaths) {
      expect(typeof p.props["aria-label"]).toBe("string");
      expect(p.props["aria-label"].length).toBeGreaterThan(0);
    }
  });

  it("uses custom fill color", () => {
    const el = EarthGlobe({ fillColor: "#ff0000" });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    // At least some paths should have the custom fill
    const withCustomFill = countryPaths.filter(
      (p: any) => p.props.fill === "#ff0000",
    );
    expect(withCustomFill.length).toBeGreaterThan(0);
  });

  it("uses custom stroke color", () => {
    const el = EarthGlobe({ strokeColor: "#000000" });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    for (const p of countryPaths) {
      expect(p.props.stroke).toBe("#000000");
    }
  });

  it("uses custom stroke width", () => {
    const el = EarthGlobe({ strokeWidth: 2 });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    for (const p of countryPaths) {
      expect(p.props["stroke-width"]).toBe("2");
    }
  });

  it("renders an outline circle", () => {
    const el = EarthGlobe({});
    const outline = findChild(
      el,
      (c: any) =>
        c.type === "circle" &&
        c.props?.fill === "none" &&
        c.props?.opacity === "0.4",
    );
    expect(outline).toBeDefined();
  });

  it("renders interaction layer when interactive", () => {
    const el = EarthGlobe({ interactive: true });
    const interactionCircle = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(interactionCircle).toBeDefined();
  });

  it("omits interaction layer when not interactive", () => {
    const el = EarthGlobe({ interactive: false });
    const interactionCircle = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(interactionCircle).toBeUndefined();
  });

  it("renders with default rotation centered on US", () => {
    const el = EarthGlobe({});
    // The US country should be visible with default rotation centered on -95, 38
    const usPath = findChild(
      el,
      (c: any) =>
        c.type === "path" && c.props?.["aria-label"] === "United States",
    );
    expect(usPath).toBeDefined();
  });

  it("renders with custom rotation", () => {
    const el = EarthGlobe({
      rotation: { longitude: 10, latitude: 50 },
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it("applies highlight colors to specific countries", () => {
    const el = EarthGlobe({
      highlightCountries: { USA: "#ff0000", CHN: "#0000ff" },
    });
    const usPath = findChild(
      el,
      (c: any) =>
        c.type === "path" && c.props?.["aria-label"] === "United States",
    );
    if (usPath) {
      expect(usPath.props.fill).toBe("#ff0000");
    }
  });
});

// ---------------------------------------------------------------------------
// EarthGlobe — graticule
// ---------------------------------------------------------------------------

describe("EarthGlobe — graticule", () => {
  it("renders graticule paths when showGraticule=true", () => {
    const el = EarthGlobe({ showGraticule: true });
    const gratPaths = findAllChildren(
      el,
      (c: any) =>
        c.type === "path" &&
        c.props?.stroke === "rgba(255,255,255,0.2)" &&
        c.props?.fill === "none",
    );
    expect(gratPaths.length).toBeGreaterThan(0);
  });

  it("does not render graticule when showGraticule=false", () => {
    const el = EarthGlobe({ showGraticule: false });
    const gratPaths = findAllChildren(
      el,
      (c: any) =>
        c.type === "path" &&
        c.props?.stroke === "rgba(255,255,255,0.2)" &&
        c.props?.fill === "none",
    );
    expect(gratPaths.length).toBe(0);
  });

  it("uses custom graticule color", () => {
    const el = EarthGlobe({
      showGraticule: true,
      graticuleColor: "rgba(0,0,0,0.3)",
    });
    const gratPaths = findAllChildren(
      el,
      (c: any) =>
        c.type === "path" &&
        c.props?.stroke === "rgba(0,0,0,0.3)" &&
        c.props?.fill === "none",
    );
    expect(gratPaths.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// EarthGlobe — interaction handlers
// ---------------------------------------------------------------------------

describe("EarthGlobe — interactions", () => {
  it("interaction layer has onmousedown handler", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(layer).toBeDefined();
    expect(typeof layer.props.onmousedown).toBe("function");
  });

  it("interaction layer has onmousemove handler", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(typeof layer.props.onmousemove).toBe("function");
  });

  it("interaction layer has onmouseup handler", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(typeof layer.props.onmouseup).toBe("function");
  });

  it("interaction layer has onmouseleave handler", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(typeof layer.props.onmouseleave).toBe("function");
  });

  it("country paths have click handler", () => {
    const clickFn = fn();
    const el = EarthGlobe({ onCountryClick: clickFn });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    expect(countryPaths.length).toBeGreaterThan(0);
    expect(typeof countryPaths[0].props.onclick).toBe("function");
  });

  it("country click handler calls onCountryClick with id", () => {
    const clickFn = fn();
    const el = EarthGlobe({ onCountryClick: clickFn });
    const usPath = findChild(
      el,
      (c: any) =>
        c.type === "path" && c.props?.["aria-label"] === "United States",
    );
    if (usPath) {
      usPath.props.onclick();
      expect(clickFn).toHaveBeenCalledWith("USA");
    }
  });

  it("country paths have mouseenter handler", () => {
    const hoverFn = fn();
    const el = EarthGlobe({ onCountryHover: hoverFn });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    expect(countryPaths.length).toBeGreaterThan(0);
    expect(typeof countryPaths[0].props.onmouseenter).toBe("function");
  });

  it("country paths have mouseleave handler", () => {
    const el = EarthGlobe({});
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    expect(countryPaths.length).toBeGreaterThan(0);
    expect(typeof countryPaths[0].props.onmouseleave).toBe("function");
  });

  it("mouseenter handler calls onCountryHover", () => {
    const hoverFn = fn();
    const el = EarthGlobe({ onCountryHover: hoverFn });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    if (countryPaths.length > 0) {
      countryPaths[0].props.onmouseenter();
      expect(hoverFn).toHaveBeenCalled();
    }
  });

  it("mouseleave handler calls onCountryHover with null", () => {
    const hoverFn = fn();
    const el = EarthGlobe({ onCountryHover: hoverFn });
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    if (countryPaths.length > 0) {
      countryPaths[0].props.onmouseleave();
      expect(hoverFn).toHaveBeenCalledWith(null);
    }
  });

  it("does not error when calling click without onCountryClick", () => {
    const el = EarthGlobe({});
    const countryPaths = findAllChildren(
      el,
      (c: any) => c.type === "path" && c.props?.role === "button",
    );
    if (countryPaths.length > 0) {
      expect(() => countryPaths[0].props.onclick()).not.toThrow();
    }
  });

  it("mousedown handler does not error", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(() =>
      layer.props.onmousedown({ clientX: 100, clientY: 100 }),
    ).not.toThrow();
  });

  it("mousemove handler does not error", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(() =>
      layer.props.onmousemove({ clientX: 120, clientY: 120 }),
    ).not.toThrow();
  });

  it("mouseup handler does not error", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(() => layer.props.onmouseup()).not.toThrow();
  });

  it("mouseleave on interaction layer does not error", () => {
    const el = EarthGlobe({ interactive: true });
    const layer = findChild(
      el,
      (c: any) => c.type === "circle" && c.props?.fill === "transparent",
    );
    expect(() => layer.props.onmouseleave()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// EarthGlobe — edge cases
// ---------------------------------------------------------------------------

describe("EarthGlobe — edge cases", () => {
  it("renders with zero dimensions", () => {
    const el = EarthGlobe({ width: 0, height: 0 });
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it("renders with very large dimensions", () => {
    const el = EarthGlobe({ width: 2000, height: 2000 });
    expect(el).not.toBeNull();
    expect(el.props.viewBox).toBe("0 0 2000 2000");
  });

  it("renders with rotation at north pole", () => {
    const el = EarthGlobe({
      rotation: { longitude: 0, latitude: 90 },
    });
    expect(el).not.toBeNull();
  });

  it("renders with rotation at south pole", () => {
    const el = EarthGlobe({
      rotation: { longitude: 0, latitude: -90 },
    });
    expect(el).not.toBeNull();
  });

  it("renders with rotation at date line", () => {
    const el = EarthGlobe({
      rotation: { longitude: 180, latitude: 0 },
    });
    expect(el).not.toBeNull();
  });

  it("renders with rotation at negative date line", () => {
    const el = EarthGlobe({
      rotation: { longitude: -180, latitude: 0 },
    });
    expect(el).not.toBeNull();
  });

  it("renders with all optional props", () => {
    const el = EarthGlobe({
      width: 500,
      height: 500,
      rotation: { longitude: 10, latitude: 50 },
      fillColor: "#00ff00",
      oceanColor: "#0000ff",
      strokeColor: "#ff0000",
      strokeWidth: 1.5,
      showGraticule: true,
      graticuleColor: "rgba(0,0,0,0.5)",
      interactive: false,
      onCountryClick: fn(),
      onCountryHover: fn(),
      hoverColor: "#ffff00",
      title: "Test Globe",
      highlightCountries: { USA: "#ff0000" },
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Test Globe");
  });

  it("renders with empty highlightCountries", () => {
    const el = EarthGlobe({ highlightCountries: {} });
    expect(el).not.toBeNull();
  });

  it("handles non-existent country in highlightCountries gracefully", () => {
    const el = EarthGlobe({
      highlightCountries: { NONEXISTENT: "#ff0000" },
    });
    expect(el).not.toBeNull();
  });

  it("preserveAspectRatio is set", () => {
    const el = EarthGlobe({});
    expect(el.props.preserveAspectRatio).toBe("xMidYMid meet");
  });

  it("xmlns is set", () => {
    const el = EarthGlobe({});
    expect(el.props.xmlns).toBe("http://www.w3.org/2000/svg");
  });

  it("has userSelect none style for drag prevention", () => {
    const el = EarthGlobe({});
    expect(el.props.style.userSelect).toBe("none");
  });
});

// ---------------------------------------------------------------------------
// EarthGlobe — different rotations show different countries
// ---------------------------------------------------------------------------

describe("EarthGlobe — rotation affects visible countries", () => {
  it("centered on Europe shows European countries", () => {
    const el = EarthGlobe({
      rotation: { longitude: 10, latitude: 50 },
    });
    const deuPath = findChild(
      el,
      (c: any) => c.type === "path" && c.props?.["aria-label"] === "Germany",
    );
    expect(deuPath).toBeDefined();
  });

  it("centered on Asia shows China", () => {
    const el = EarthGlobe({
      rotation: { longitude: 100, latitude: 35 },
    });
    const chnPath = findChild(
      el,
      (c: any) => c.type === "path" && c.props?.["aria-label"] === "China",
    );
    expect(chnPath).toBeDefined();
  });

  it("centered on Australia shows Australia", () => {
    const el = EarthGlobe({
      rotation: { longitude: 135, latitude: -25 },
    });
    const ausPath = findChild(
      el,
      (c: any) => c.type === "path" && c.props?.["aria-label"] === "Australia",
    );
    expect(ausPath).toBeDefined();
  });
});
