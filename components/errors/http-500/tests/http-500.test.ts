// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Http500 } from "../src/index";
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

describe("Http500 -- VNode structure", () => {
  it("returns a VNode wrapping HttpErrorPage", () => {
    const vnode = Http500({});
    expect(vnode).not.toBeNull();
    expect(vnode.type).toBe(HttpErrorPage);
  });

  it("passes statusCode 500", () => {
    const vnode = Http500({});
    expect(vnode.props.statusCode).toBe(500);
  });

  it('passes title "Internal Server Error"', () => {
    const vnode = Http500({});
    expect(vnode.props.title).toBe("Internal Server Error");
  });

  it("passes default description", () => {
    const vnode = Http500({});
    expect(vnode.props.description).toBe(
      "Something went wrong on the server. Please try again later.",
    );
  });

  it("passes showGoBack as false", () => {
    const vnode = Http500({});
    expect(vnode.props.showGoBack).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Override tests
// ---------------------------------------------------------------------------

describe("Http500 -- overrides", () => {
  it("accepts custom description", () => {
    const vnode = Http500({ description: "Custom error." });
    expect(vnode.props.description).toBe("Custom error.");
  });

  it("accepts custom actionLabel", () => {
    const vnode = Http500({ actionLabel: "Retry" });
    expect(vnode.props.actionLabel).toBe("Retry");
  });

  it("passes custom onAction handler", () => {
    const onAction = fn();
    const vnode = Http500({ onAction });
    expect(vnode.props.onAction).toBe(onAction);
  });

  it("uses default description when not overridden", () => {
    const vnode = Http500({});
    expect(vnode.props.description).toBe(
      "Something went wrong on the server. Please try again later.",
    );
  });

  it("passes undefined actionLabel when not provided", () => {
    const vnode = Http500({});
    expect(vnode.props.actionLabel).toBeUndefined();
  });

  it("passes undefined onAction when not provided", () => {
    const vnode = Http500({});
    expect(vnode.props.onAction).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rendered output tests (call the inner component to verify end result)
// ---------------------------------------------------------------------------

describe("Http500 -- rendered output", () => {
  it('renders with role="alert" and aria-live="assertive"', () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    expect(rendered.props.role).toBe("alert");
    expect(rendered.props["aria-live"]).toBe("assertive");
  });

  it("renders status code 500 in watermark", () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[0].props.children).toBe("500");
    expect(children[0].props["aria-hidden"]).toBe("true");
  });

  it("renders title in h1", () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[1].type).toBe("h1");
    expect(children[1].props.children).toBe("Internal Server Error");
  });

  it("renders description in p", () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[2].type).toBe("p");
    expect(children[2].props.children).toBe(
      "Something went wrong on the server. Please try again later.",
    );
  });

  it('renders "Go Home" button', () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[3].type).toBe("button");
    expect(children[3].props.children).toBe("Go Home");
  });

  it('does not render "Go Back" button in rendered output', () => {
    const vnode = Http500({});
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    expect(children[4]).toBeNull();
  });

  it("calls onAction when primary button is clicked", () => {
    const onAction = fn();
    const vnode = Http500({ onAction });
    const rendered = vnode.type(vnode.props);
    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    children[3].props.onClick();
    expect(onAction).toHaveBeenCalledOnce();
  });
});
