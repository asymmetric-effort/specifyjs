// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Http401 -- Unauthorized error page component.
 *
 * Thin wrapper around HttpErrorPage with 401-specific defaults.
 */

import { createElement } from "../../../../core/src/index";
import { HttpErrorPage } from "../../_shared/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Http401Props {
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

export function Http401(props: Http401Props) {
  return createElement(HttpErrorPage, {
    statusCode: 401,
    title: "Unauthorized",
    description: props.description ?? "You must sign in to access this page.",
    actionLabel: props.actionLabel,
    onAction: props.onAction,
    showGoBack: true,
  });
}
