// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http503 -- Service Unavailable error page component.
 *
 * Thin wrapper around HttpErrorPage with 503-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http503Props {
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

export function Http503(props: Http503Props) {
  return createElement(HttpErrorPage, {
    statusCode: 503,
    title: "Service Unavailable",
    description:
      props.description ??
      "The service is temporarily unavailable. Please try again later.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: false,
  });
}
