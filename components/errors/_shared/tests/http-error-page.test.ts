// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { HttpErrorPage } from "../src/index";
import {
  installMockDispatcher,
  teardownMockDispatcher,
} from "../../../_test-helpers/mock-dispatcher";

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe("HttpErrorPage — happy path", () => {
  it("renders with required props only", () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    expect(el).not.toBeNull();
    expect(el.props.role).toBe("alert");
    expect(el.props["aria-live"]).toBe("assertive");
  });

  it("renders the status code as text", () => {
    const el = HttpErrorPage({ statusCode: 500, title: "Server Error" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    // First child is the watermark div
    const watermark = children[0];
    expect(watermark.props["aria-hidden"]).toBe("true");
    expect(watermark.props.children).toBe("500");
  });

  it("renders the title in an h1", () => {
    const el = HttpErrorPage({ statusCode: 403, title: "Forbidden" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const h1 = children[1];
    expect(h1.type).toBe("h1");
    expect(h1.props.children).toBe("Forbidden");
  });

  it("renders description when provided", () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      description: "Page missing.",
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const desc = children[2];
    expect(desc).not.toBeNull();
    expect(desc.type).toBe("p");
    expect(desc.props.children).toBe("Page missing.");
  });

  it("renders null when description is omitted", () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[2]).toBeNull();
  });

  it('renders primary button with default label "Go Home"', () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const btn = children[3];
    expect(btn.type).toBe("button");
    expect(btn.props.children).toBe("Go Home");
  });

  it("renders primary button with custom actionLabel", () => {
    const el = HttpErrorPage({
      statusCode: 401,
      title: "Unauthorized",
      actionLabel: "Sign In",
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const btn = children[3];
    expect(btn.props.children).toBe("Sign In");
  });

  it("calls custom onAction when provided", () => {
    const onAction = fn();
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      onAction,
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const btn = children[3];
    btn.props.onClick();
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders "Go Back" button when showGoBack is true', () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      showGoBack: true,
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const goBack = children[4];
    expect(goBack).not.toBeNull();
    expect(goBack.type).toBe("button");
    expect(goBack.props.children).toBe("Go Back");
  });

  it('does not render "Go Back" button when showGoBack is false', () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      showGoBack: false,
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[4]).toBeNull();
  });

  it('does not render "Go Back" button when showGoBack is omitted', () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[4]).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Style tests
// ---------------------------------------------------------------------------

describe("HttpErrorPage — styles", () => {
  it("container uses flex column centered layout", () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const style = el.props.style;
    expect(style.display).toBe("flex");
    expect(style.flexDirection).toBe("column");
    expect(style.alignItems).toBe("center");
    expect(style.justifyContent).toBe("center");
    expect(style.minHeight).toBe("100vh");
    expect(style.textAlign).toBe("center");
  });

  it("watermark has large font and low opacity", () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    const watermark = children[0];
    expect(watermark.props.style.fontSize).toBe("120px");
    expect(watermark.props.style.opacity).toBe("0.15");
    expect(watermark.props.style.fontWeight).toBe("700");
  });

  it("uses currentColor throughout (no hardcoded hex colors)", () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      description: "Missing",
      showGoBack: true,
    });
    const containerColor = el.props.style.color;
    expect(containerColor).toBe("currentColor");

    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];

    // Watermark
    expect(children[0].props.style.color).toBe("currentColor");
    // Title
    expect(children[1].props.style.color).toBe("currentColor");
    // Description
    expect(children[2].props.style.color).toBe("currentColor");
    // Primary button
    expect(children[3].props.style.color).toBe("currentColor");
    // Go back button
    expect(children[4].props.style.color).toBe("currentColor");
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe("HttpErrorPage — sad path", () => {
  it("handles zero status code", () => {
    const el = HttpErrorPage({ statusCode: 0, title: "Unknown" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[0].props.children).toBe("0");
  });

  it("handles empty title", () => {
    const el = HttpErrorPage({ statusCode: 404, title: "" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[1].props.children).toBe("");
  });

  it("handles empty description", () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      description: "",
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    // Empty string is falsy, so description should be null
    expect(children[2]).toBeNull();
  });

  it("handles empty actionLabel gracefully", () => {
    const el = HttpErrorPage({
      statusCode: 404,
      title: "Not Found",
      actionLabel: "",
    });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    // Empty string is not nullish, so ?? passes it through
    expect(children[3].props.children).toBe("");
  });
});

// ---------------------------------------------------------------------------
// ARIA accessibility tests
// ---------------------------------------------------------------------------

describe("HttpErrorPage — accessibility", () => {
  it('has role="alert" on container', () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    expect(el.props.role).toBe("alert");
  });

  it('has aria-live="assertive" on container', () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    expect(el.props["aria-live"]).toBe("assertive");
  });

  it('watermark has aria-hidden="true"', () => {
    const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
    const children = Array.isArray(el.props.children)
      ? el.props.children
      : [el.props.children];
    expect(children[0].props["aria-hidden"]).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// Default action behavior tests
// ---------------------------------------------------------------------------

describe("HttpErrorPage — default action", () => {
  it('default action sets window.location.href to "/"', () => {
    const originalWindow = globalThis.window;
    const mockWindow = { location: { href: "" }, history: { back: fn() } };
    (globalThis as any).window = mockWindow;

    try {
      const el = HttpErrorPage({ statusCode: 404, title: "Not Found" });
      const children = Array.isArray(el.props.children)
        ? el.props.children
        : [el.props.children];
      children[3].props.onClick();
      expect(mockWindow.location.href).toBe("/");
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });

  it("go back calls window.history.back()", () => {
    const originalWindow = globalThis.window;
    const mockBack = fn();
    const mockWindow = { location: { href: "" }, history: { back: mockBack } };
    (globalThis as any).window = mockWindow;

    try {
      const el = HttpErrorPage({
        statusCode: 404,
        title: "Not Found",
        showGoBack: true,
      });
      const children = Array.isArray(el.props.children)
        ? el.props.children
        : [el.props.children];
      children[4].props.onClick();
      expect(mockBack).toHaveBeenCalledOnce();
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });
});
