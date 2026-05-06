// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Http403 } from "../src/index";
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

describe("Http403 -- VNode structure", () => {
  it("returns a VNode wrapping HttpErrorPage", () => {
    const vnode = Http403({});
    expect(vnode).not.toBeNull();
    expect(vnode.type).toBe(HttpErrorPage);
  });

  it("passes statusCode 403", () => {
    const vnode = Http403({});
    expect(vnode.props.statusCode).toBe(403);
  });

  it('passes title "Forbidden"', () => {
    const vnode = Http403({});
    expect(vnode.props.title).toBe("Forbidden");
  });

  it("passes default description", () => {
    const vnode = Http403({});
    expect(vnode.props.description).toBe(
      "You do not have permission to access this resource.",
    );
  });

  it("passes showGoBack as true", () => {
    const vnode = Http403({});
    expect(vnode.props.showGoBack).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Override tests
// ---------------------------------------------------------------------------

describe("Http403 -- overrides", () => {
  it("accepts custom description", () => {
    const vnode = Http403({ description: "Custom error." });
    expect(vnode.props.description).toBe("Custom error.");
  });

  it("accepts custom actionLabel", () => {
    const vnode = Http403({ actionLabel: "Retry" });
    expect(vnode.props.actionLabel).toBe("Retry");
  });

  it("passes custom onAction handler", () => {
    const onAction = vi.fn();
    const vnode = Http403({ onAction });
    expect(vnode.props.onAction).toBe(onAction);
  });

  it("uses default description when not overridden", () => {
    const vnode = Http403({});
    expect(vnode.props.description).toBe(
      "You do not have permission to access this resource.",
    );
  });

  it("passes undefined actionLabel when not provided", () => {
    const vnode = Http403({});
    expect(vnode.props.actionLabel).toBeUndefined();
  });

  it("passes undefined onAction when not provided", () => {
    const vnode = Http403({});
    expect(vnode.props.onAction).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rendered output tests (call the inner component to verify end result)
// ---------------------------------------------------------------------------

describe("Http403 -- rendered output", () => {
  it('renders with role="alert" and aria-live="assertive"', () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    expect(rendered.props.role).toBe("alert");
    expect(rendered.props["aria-live"]).toBe("assertive");
  });

  it("renders status code 403 in watermark", () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[0].props.children).toBe("403");
    expect(children[0].props["aria-hidden"]).toBe("true");
  });

  it("renders title in h1", () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[1].type).toBe("h1");
    expect(children[1].props.children).toBe("Forbidden");
  });

  it("renders description in p", () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[2].type).toBe("p");
    expect(children[2].props.children).toBe(
      "You do not have permission to access this resource.",
    );
  });

  it('renders "Go Home" button', () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[3].type).toBe("button");
    expect(children[3].props.children).toBe("Go Home");
  });

  it('renders "Go Back" button in rendered output', () => {
    const vnode = Http403({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[4]).not.toBeNull();
    expect(children[4].props.children).toBe("Go Back");
  });

  it("calls onAction when primary button is clicked", () => {
    const onAction = vi.fn();
    const vnode = Http403({ onAction });
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    children[3].props.onClick();
    expect(onAction).toHaveBeenCalledOnce();
  });
});
