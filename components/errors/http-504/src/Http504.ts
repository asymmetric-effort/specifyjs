// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http504 -- Gateway Timeout error page component.
 *
 * Thin wrapper around HttpErrorPage with 504-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http504Props {
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

export function Http504(props: Http504Props) {
  return createElement(HttpErrorPage, {
    statusCode: 504,
    title: "Gateway Timeout",
    description:
      props.description ??
      "The server did not respond in time. Please try again later.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: false,
  });
}
