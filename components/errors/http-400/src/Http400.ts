// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http400 -- Bad Request error page component.
 *
 * Thin wrapper around HttpErrorPage with 400-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http400Props {
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

export function Http400(props: Http400Props) {
  return createElement(HttpErrorPage, {
    statusCode: 400,
    title: "Bad Request",
    description:
      props.description ??
      "The request could not be understood. Please check your input.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: true,
  });
}
