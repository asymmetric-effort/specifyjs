// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http500 -- Internal Server Error error page component.
 *
 * Thin wrapper around HttpErrorPage with 500-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http500Props {
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

export function Http500(props: Http500Props) {
  return createElement(HttpErrorPage, {
    statusCode: 500,
    title: "Internal Server Error",
    description:
      props.description ??
      "Something went wrong on the server. Please try again later.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: false,
  });
}
