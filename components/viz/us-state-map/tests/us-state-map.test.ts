// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { USStateMap, US_STATE_PATHS } from "../src/index";
import {
  installMockDispatcher,
  teardownMockDispatcher,
} from "../../../_test-helpers/mock-dispatcher";

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe("USStateMap — happy path", () => {
  it("renders with default props", () => {
    const el = USStateMap({});
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it("renders with custom dimensions", () => {
    const el = USStateMap({ width: 1200, height: 800 });
    expect(el).not.toBeNull();
    expect(el.props.viewBox).toBe("0 0 1200 800");
  });

  it("renders with stateColors", () => {
    const el = USStateMap({
      stateColors: { CA: "#ff0000", TX: "#0000ff", NY: "#00ff00" },
    });
    expect(el).not.toBeNull();
  });

  it("renders with custom defaultColor", () => {
    const el = USStateMap({ defaultColor: "#cccccc" });
    expect(el).not.toBeNull();
  });

  it("renders with custom strokeColor and strokeWidth", () => {
    const el = USStateMap({ strokeColor: "#000000", strokeWidth: 2 });
    expect(el).not.toBeNull();
  });

  it("renders with custom hoverColor", () => {
    const el = USStateMap({ hoverColor: "#ff9900" });
    expect(el).not.toBeNull();
  });

  it("renders with custom title", () => {
    const el = USStateMap({ title: "Election Results" });
    expect(el).not.toBeNull();
    expect(el.props["aria-label"]).toBe("Election Results");
  });

  it("renders with onStateClick handler", () => {
    const clicks: string[] = [];
    const el = USStateMap({ onStateClick: (id: string) => clicks.push(id) });
    expect(el).not.toBeNull();
  });

  it("renders with onStateHover handler", () => {
    const hovers: (string | null)[] = [];
    const el = USStateMap({
      onStateHover: (id: string | null) => hovers.push(id),
    });
    expect(el).not.toBeNull();
  });

  it("renders all 51 state/territory paths", () => {
    const el = USStateMap({});
    // children: title element + 51 state paths
    const childCount = el.children.length;
    expect(childCount).toBe(52); // 1 title + 51 paths
  });

  it("includes data-state attribute on each path", () => {
    const el = USStateMap({});
    // Skip first child (title element)
    for (let i = 1; i < el.children.length; i++) {
      const child = el.children[i];
      expect(child.props["data-state"]).toBeTruthy();
    }
  });

  it("uses stateColors for matching states", () => {
    const el = USStateMap({
      stateColors: { CA: "#ff0000" },
      defaultColor: "#cccccc",
    });
    // Find the CA path
    let caPath = null;
    for (let i = 1; i < el.children.length; i++) {
      if (el.children[i].props["data-state"] === "CA") {
        caPath = el.children[i];
        break;
      }
    }
    expect(caPath).not.toBeNull();
    expect(caPath!.props.fill).toBe("#ff0000");
  });

  it("uses defaultColor for states without stateColors entry", () => {
    const el = USStateMap({
      stateColors: { CA: "#ff0000" },
      defaultColor: "#abcdef",
    });
    // Find a state that is NOT CA
    let otherPath = null;
    for (let i = 1; i < el.children.length; i++) {
      if (el.children[i].props["data-state"] === "TX") {
        otherPath = el.children[i];
        break;
      }
    }
    expect(otherPath).not.toBeNull();
    expect(otherPath!.props.fill).toBe("#abcdef");
  });

  it('sets role="button" when onStateClick is provided', () => {
    const el = USStateMap({ onStateClick: () => {} });
    for (let i = 1; i < el.children.length; i++) {
      expect(el.children[i].props.role).toBe("button");
    }
  });

  it('sets role="img" when no onStateClick is provided', () => {
    const el = USStateMap({});
    for (let i = 1; i < el.children.length; i++) {
      expect(el.children[i].props.role).toBe("img");
    }
  });

  it("sets cursor to pointer when onStateClick is provided", () => {
    const el = USStateMap({ onStateClick: () => {} });
    for (let i = 1; i < el.children.length; i++) {
      expect(el.children[i].props.style.cursor).toBe("pointer");
    }
  });

  it("sets cursor to default when no onStateClick", () => {
    const el = USStateMap({});
    for (let i = 1; i < el.children.length; i++) {
      expect(el.children[i].props.style.cursor).toBe("default");
    }
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe("USStateMap — sad path", () => {
  it("handles empty stateColors", () => {
    const el = USStateMap({ stateColors: {} });
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it("handles unknown state abbreviations in stateColors gracefully", () => {
    const el = USStateMap({
      stateColors: { XX: "#ff0000", ZZ: "#00ff00" },
    });
    expect(el).not.toBeNull();
  });

  it("handles zero strokeWidth", () => {
    const el = USStateMap({ strokeWidth: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// US_STATE_PATHS data tests
// ---------------------------------------------------------------------------

describe("US_STATE_PATHS", () => {
  it("contains 51 entries (50 states + DC)", () => {
    const keys = Object.keys(US_STATE_PATHS);
    expect(keys.length).toBe(51);
  });

  it("each entry has name and path fields", () => {
    for (const key of Object.keys(US_STATE_PATHS)) {
      const entry = US_STATE_PATHS[key]!;
      expect(typeof entry.name).toBe("string");
      expect(entry.name.length).toBeGreaterThan(0);
      expect(typeof entry.path).toBe("string");
      expect(entry.path.length).toBeGreaterThan(0);
    }
  });

  it("includes all expected state abbreviations", () => {
    const expected = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
      "DC",
    ];
    for (const abbr of expected) {
      expect(US_STATE_PATHS[abbr]).toBeDefined();
    }
  });

  it("has correct names for sample states", () => {
    expect(US_STATE_PATHS["CA"]!.name).toBe("California");
    expect(US_STATE_PATHS["TX"]!.name).toBe("Texas");
    expect(US_STATE_PATHS["NY"]!.name).toBe("New York");
    expect(US_STATE_PATHS["DC"]!.name).toBe("District of Columbia");
  });
});

// ---------------------------------------------------------------------------
// ARIA compliance tests
// ---------------------------------------------------------------------------

describe("USStateMap — ARIA compliance", () => {
  it('SVG has role="img"', () => {
    const el = USStateMap({});
    expect(el.props.role).toBe("img");
  });

  it("SVG has aria-label matching title", () => {
    const el = USStateMap({ title: "Test Map" });
    expect(el.props["aria-label"]).toBe("Test Map");
  });

  it("uses default aria-label when no title provided", () => {
    const el = USStateMap({});
    expect(el.props["aria-label"]).toBe("Map of the United States");
  });

  it("each state path has aria-label with state name", () => {
    const el = USStateMap({});
    for (let i = 1; i < el.children.length; i++) {
      const child = el.children[i];
      const stateId = child.props["data-state"];
      const expectedName = US_STATE_PATHS[stateId]!.name;
      expect(child.props["aria-label"]).toBe(expectedName);
    }
  });

  it("interactive state paths have tabIndex when clickable", () => {
    const el = USStateMap({ onStateClick: () => {} });
    for (let i = 1; i < el.children.length; i++) {
      expect(el.children[i].props.tabIndex).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe("USStateMap — defaults", () => {
  it("uses default width and height in viewBox", () => {
    const el = USStateMap({});
    expect(el.props.viewBox).toBe("0 0 959 593");
  });

  it("uses 100% width for responsive sizing", () => {
    const el = USStateMap({});
    expect(el.props.width).toBe("100%");
  });

  it("preserves aspect ratio", () => {
    const el = USStateMap({});
    expect(el.props.preserveAspectRatio).toBe("xMidYMid meet");
  });

  it("includes a title element as first child", () => {
    const el = USStateMap({});
    expect(el.children[0].type).toBe("title");
    expect(el.children[0].children[0]).toBe("Map of the United States");
  });

  it("includes a custom title element", () => {
    const el = USStateMap({ title: "My Custom Map" });
    expect(el.children[0].children[0]).toBe("My Custom Map");
  });
});
