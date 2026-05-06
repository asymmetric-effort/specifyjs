// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http502 -- Bad Gateway error page component.
 *
 * Thin wrapper around HttpErrorPage with 502-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http502Props {
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

export function Http502(props: Http502Props) {
  return createElement(HttpErrorPage, {
    statusCode: 502,
    title: "Bad Gateway",
    description:
      props.description ??
      "The server received an invalid response. Please try again later.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: false,
  });
}
