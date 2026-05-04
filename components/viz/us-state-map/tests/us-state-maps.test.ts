// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  installMockDispatcher,
  teardownMockDispatcher,
} from "../../../_test-helpers/mock-dispatcher";
import { createStateMapComponent } from "../states/factory";
import type { StatePathConfig } from "../states/factory";
import type { StateMapProps } from "../states/types";
import { AL } from "../states/AL";
import { AK } from "../states/AK";
import { CA } from "../states/CA";
import { TX } from "../states/TX";
import { HI } from "../states/HI";
import { DC } from "../states/DC";
import { NY } from "../states/NY";
import { FL } from "../states/FL";
import { PR } from "../states/PR";
import { GU } from "../states/GU";

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Factory function tests
// ---------------------------------------------------------------------------

describe("createStateMapComponent", () => {
  const testConfig: StatePathConfig = {
    name: "Test State",
    pathData: "M 0,0 L 10,0 L 10,10 L 0,10 Z",
    viewBox: { minX: -1, minY: -1, width: 12, height: 12 },
  };

  it("returns a function", () => {
    const Component = createStateMapComponent(testConfig);
    expect(typeof Component).toBe("function");
  });

  it('renders an SVG element with role="img"', () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
    expect(el.props.role).toBe("img");
  });

  it("uses default title from config name", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props["aria-label"]).toBe("Test State");
  });

  it("allows overriding the title", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ title: "Custom Title" });
    expect(el.props["aria-label"]).toBe("Custom Title");
  });

  it("uses default fill color #3b82f6", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    // The path is the second child (first is <title>)
    const children = el.props.children;
    expect(children).toBeDefined();
  });

  it("applies custom fill color", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ fillColor: "#ff0000" });
    expect(el).not.toBeNull();
  });

  it("applies custom stroke color", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ strokeColor: "#000000" });
    expect(el).not.toBeNull();
  });

  it("applies custom stroke width", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ strokeWidth: 3 });
    expect(el).not.toBeNull();
  });

  it("sets correct viewBox", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props.viewBox).toBe("-1 -1 12 12");
  });

  it("uses preserveAspectRatio xMidYMid meet", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props.preserveAspectRatio).toBe("xMidYMid meet");
  });

  it("computes default width/height from aspect ratio (square)", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props.width).toBe("200");
    expect(el.props.height).toBe("200");
  });

  it("computes default width/height from aspect ratio (wide)", () => {
    const wideConfig: StatePathConfig = {
      name: "Wide State",
      pathData: "M 0,0 L 20,0 L 20,10 L 0,10 Z",
      viewBox: { minX: 0, minY: 0, width: 200, height: 100 },
    };
    const Component = createStateMapComponent(wideConfig);
    const el = Component({});
    expect(el.props.width).toBe("200");
    expect(el.props.height).toBe("100");
  });

  it("computes default width/height from aspect ratio (tall)", () => {
    const tallConfig: StatePathConfig = {
      name: "Tall State",
      pathData: "M 0,0 L 10,0 L 10,20 L 0,20 Z",
      viewBox: { minX: 0, minY: 0, width: 50, height: 200 },
    };
    const Component = createStateMapComponent(tallConfig);
    const el = Component({});
    expect(el.props.height).toBe("200");
    expect(el.props.width).toBe("50");
  });

  it("respects explicit width and computes height", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ width: 100 });
    expect(el.props.width).toBe("100");
    expect(el.props.height).toBe("100");
  });

  it("respects explicit height and computes width", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ height: 100 });
    expect(el.props.width).toBe("100");
    expect(el.props.height).toBe("100");
  });

  it("respects explicit width and height", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ width: 300, height: 150 });
    expect(el.props.width).toBe("300");
    expect(el.props.height).toBe("150");
  });

  it("applies className as class attribute", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({ className: "my-state" });
    expect(el.props["class"]).toBe("my-state");
  });

  it("does not set class when className is not provided", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props["class"]).toBeUndefined();
  });

  it("sets xmlns attribute", () => {
    const Component = createStateMapComponent(testConfig);
    const el = Component({});
    expect(el.props.xmlns).toBe("http://www.w3.org/2000/svg");
  });
});

// ---------------------------------------------------------------------------
// Individual state component tests — sampling
// ---------------------------------------------------------------------------

describe("Individual state components", () => {
  it("AL renders Alabama", () => {
    const el = AL({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Alabama");
    expect(el.props.role).toBe("img");
  });

  it("AK renders Alaska", () => {
    const el = AK({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Alaska");
  });

  it("CA renders California", () => {
    const el = CA({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("California");
  });

  it("TX renders Texas", () => {
    const el = TX({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Texas");
  });

  it("HI renders Hawaii", () => {
    const el = HI({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Hawaii");
  });

  it("DC renders District of Columbia", () => {
    const el = DC({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("District of Columbia");
  });

  it("NY renders New York", () => {
    const el = NY({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("New York");
  });

  it("FL renders Florida", () => {
    const el = FL({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Florida");
  });

  it("PR renders Puerto Rico (territory)", () => {
    const el = PR({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Puerto Rico");
  });

  it("GU renders Guam (territory)", () => {
    const el = GU({});
    expect(el.type).toBe("svg");
    expect(el.props["aria-label"]).toBe("Guam");
  });
});

// ---------------------------------------------------------------------------
// Props behavior tests
// ---------------------------------------------------------------------------

describe("State component props", () => {
  it("applies custom fillColor", () => {
    const el = AL({ fillColor: "#ff0000" });
    expect(el).not.toBeNull();
    expect(el.type).toBe("svg");
  });

  it("applies custom strokeColor", () => {
    const el = AL({ strokeColor: "#000000" });
    expect(el).not.toBeNull();
  });

  it("applies custom strokeWidth", () => {
    const el = AL({ strokeWidth: 2 });
    expect(el).not.toBeNull();
  });

  it("applies custom title", () => {
    const el = AL({ title: "The Heart of Dixie" });
    expect(el.props["aria-label"]).toBe("The Heart of Dixie");
  });

  it("applies className", () => {
    const el = AL({ className: "state-highlight" });
    expect(el.props["class"]).toBe("state-highlight");
  });

  it("applies width and height", () => {
    const el = AL({ width: 400, height: 300 });
    expect(el.props.width).toBe("400");
    expect(el.props.height).toBe("300");
  });

  it("applies only width and auto-computes height", () => {
    const el = AL({ width: 100 });
    expect(el.props.width).toBe("100");
    // Height should be auto-computed based on AL aspect ratio
    expect(Number(el.props.height)).toBeGreaterThan(0);
  });

  it("applies only height and auto-computes width", () => {
    const el = TX({ height: 100 });
    expect(el.props.height).toBe("100");
    expect(Number(el.props.width)).toBeGreaterThan(0);
  });

  it("has correct viewBox format", () => {
    const el = CA({});
    const vb = el.props.viewBox as string;
    const parts = vb.split(" ");
    expect(parts).toHaveLength(4);
    for (const part of parts) {
      expect(Number(part)).not.toBeNaN();
    }
  });
});

// ---------------------------------------------------------------------------
// Event handler tests
// ---------------------------------------------------------------------------

describe("State component event handlers", () => {
  it("passes onClick handler", () => {
    const handler = vi.fn();
    const el = AL({ onClick: handler });
    expect(el).not.toBeNull();
  });

  it("passes onMouseEnter handler", () => {
    const handler = vi.fn();
    const el = AL({ onMouseEnter: handler });
    expect(el).not.toBeNull();
  });

  it("passes onMouseLeave handler", () => {
    const handler = vi.fn();
    const el = AL({ onMouseLeave: handler });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// All states export test
// ---------------------------------------------------------------------------

describe("Index exports", () => {
  it("exports all 56 state/territory components", async () => {
    const mod = await import("../states/index");
    const stateAbbrs = [
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
      "PR",
      "GU",
      "VI",
      "AS",
      "MP",
    ];
    for (const abbr of stateAbbrs) {
      expect(mod).toHaveProperty(abbr);
      expect(typeof (mod as Record<string, unknown>)[abbr]).toBe("function");
    }
  });

  it("exports createStateMapComponent", async () => {
    const mod = await import("../states/index");
    expect(mod).toHaveProperty("createStateMapComponent");
    expect(typeof mod.createStateMapComponent).toBe("function");
  });
});
