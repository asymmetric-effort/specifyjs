// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http429 -- Too Many Requests error page component.
 *
 * Thin wrapper around HttpErrorPage with 429-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http429Props {
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

export function Http429(props: Http429Props) {
  return createElement(HttpErrorPage, {
    statusCode: 429,
    title: "Too Many Requests",
    description:
      props.description ??
      "You have sent too many requests. Please wait and try again.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: true,
  });
}
