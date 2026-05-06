// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http404 -- Not Found error page component.
 *
 * Thin wrapper around HttpErrorPage with 404-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http404Props {
  /** Override the default description */
  description?: string;
  /** Override the primary action button label */
  actionLabel?: string;
  /** Override the primary action handler */
  onAction?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Http404(props: Http404Props) {
  return createElement(HttpErrorPage, {
    statusCode: 404,
    title: "Not Found",
    description:
      props.description ??
      "The page you are looking for does not exist or has been moved.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: true,
  });
}
