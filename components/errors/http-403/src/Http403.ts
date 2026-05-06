// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http403 -- Forbidden error page component.
 *
 * Thin wrapper around HttpErrorPage with 403-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http403Props {
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

export function Http403(props: Http403Props) {
  return createElement(HttpErrorPage, {
    statusCode: 403,
    title: "Forbidden",
    description:
      props.description ??
      "You do not have permission to access this resource.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: true,
  });
}
