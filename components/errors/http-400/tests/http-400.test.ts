// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Http400 } from "../src/index";
import { HttpErrorPage } from "../../_shared/src/index";
import {
  installMockDispatcher,
  teardownMockDispatcher,
} from "../../../_test-helpers/mock-dispatcher";

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// VNode structure tests (createElement returns a VNode, not rendered output)
// ---------------------------------------------------------------------------

describe("Http400 -- VNode structure", () => {
  it("returns a VNode wrapping HttpErrorPage", () => {
    const vnode = Http400({});
    expect(vnode).not.toBeNull();
    expect(vnode.type).toBe(HttpErrorPage);
  });

  it("passes statusCode 400", () => {
    const vnode = Http400({});
    expect(vnode.props.statusCode).toBe(400);
  });

  it('passes title "Bad Request"', () => {
    const vnode = Http400({});
    expect(vnode.props.title).toBe("Bad Request");
  });

  it("passes default description", () => {
    const vnode = Http400({});
    expect(vnode.props.description).toBe(
      "The request could not be understood. Please check your input.",
    );
  });

  it("passes showGoBack as true", () => {
    const vnode = Http400({});
    expect(vnode.props.showGoBack).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Override tests
// ---------------------------------------------------------------------------

describe("Http400 -- overrides", () => {
  it("accepts custom description", () => {
    const vnode = Http400({ description: "Custom error." });
    expect(vnode.props.description).toBe("Custom error.");
  });

  it("accepts custom actionLabel", () => {
    const vnode = Http400({ actionLabel: "Retry" });
    expect(vnode.props.actionLabel).toBe("Retry");
  });

  it("passes custom onAction handler", () => {
    const onAction = vi.fn();
    const vnode = Http400({ onAction });
    expect(vnode.props.onAction).toBe(onAction);
  });

  it("uses default description when not overridden", () => {
    const vnode = Http400({});
    expect(vnode.props.description).toBe(
      "The request could not be understood. Please check your input.",
    );
  });

  it("passes undefined actionLabel when not provided", () => {
    const vnode = Http400({});
    expect(vnode.props.actionLabel).toBeUndefined();
  });

  it("passes undefined onAction when not provided", () => {
    const vnode = Http400({});
    expect(vnode.props.onAction).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rendered output tests (call the inner component to verify end result)
// ---------------------------------------------------------------------------

describe("Http400 -- rendered output", () => {
  it('renders with role="alert" and aria-live="assertive"', () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    expect(rendered.props.role).toBe("alert");
    expect(rendered.props["aria-live"]).toBe("assertive");
  });

  it("renders status code 400 in watermark", () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[0].props.children).toBe("400");
    expect(children[0].props["aria-hidden"]).toBe("true");
  });

  it("renders title in h1", () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[1].type).toBe("h1");
    expect(children[1].props.children).toBe("Bad Request");
  });

  it("renders description in p", () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[2].type).toBe("p");
    expect(children[2].props.children).toBe(
      "The request could not be understood. Please check your input.",
    );
  });

  it('renders "Go Home" button', () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[3].type).toBe("button");
    expect(children[3].props.children).toBe("Go Home");
  });

  it('renders "Go Back" button in rendered output', () => {
    const vnode = Http400({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[4]).not.toBeNull();
    expect(children[4].props.children).toBe("Go Back");
  });

  it("calls onAction when primary button is clicked", () => {
    const onAction = vi.fn();
    const vnode = Http400({ onAction });
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    children[3].props.onClick();
    expect(onAction).toHaveBeenCalledOnce();
  });
});
