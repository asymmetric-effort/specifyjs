// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * HttpErrorPage -- Base layout component for HTTP error pages.
 *
 * Renders a centered full-height container with a large watermark status code,
 * title, description, and optional action buttons.
 */

import { createElement } from "../../../../core/src/index";
import { useCallback, useMemo } from "../../../../core/src/hooks/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HttpErrorPageProps {
  /** HTTP status code (e.g. 404) */
  statusCode: number;
  /** Error title (e.g. "Not Found") */
  title: string;
  /** Descriptive message */
  description?: string;
  /** Primary action button label (defaults to "Go Home") */
  actionLabel?: string;
  /** Primary action handler (defaults to navigate('/')) */
  onAction?: () => void;
  /** Show "Go Back" secondary action */
  showGoBack?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HttpErrorPage(props: HttpErrorPageProps) {
  const actionLabel = props.actionLabel ?? "Go Home";

  const containerStyle = useMemo<Record<string, string>>(
    () => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      textAlign: "center",
      padding: "24px",
      fontFamily: "inherit",
      color: "currentColor",
    }),
    [],
  );

  const watermarkStyle = useMemo<Record<string, string>>(
    () => ({
      fontSize: "120px",
      fontWeight: "700",
      lineHeight: "1",
      opacity: "0.15",
      margin: "0",
      color: "currentColor",
      userSelect: "none",
    }),
    [],
  );

  const titleStyle = useMemo<Record<string, string>>(
    () => ({
      fontSize: "24px",
      fontWeight: "700",
      margin: "16px 0 8px",
      color: "currentColor",
    }),
    [],
  );

  const descriptionStyle = useMemo<Record<string, string>>(
    () => ({
      fontSize: "16px",
      margin: "0 0 24px",
      opacity: "0.7",
      maxWidth: "480px",
      color: "currentColor",
    }),
    [],
  );

  const primaryButtonStyle = useMemo<Record<string, string>>(
    () => ({
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: "600",
      border: "2px solid currentColor",
      borderRadius: "6px",
      backgroundColor: "transparent",
      color: "currentColor",
      cursor: "pointer",
      textDecoration: "none",
    }),
    [],
  );

  const goBackStyle = useMemo<Record<string, string>>(
    () => ({
      marginTop: "12px",
      fontSize: "14px",
      background: "none",
      border: "none",
      cursor: "pointer",
      textDecoration: "underline",
      color: "currentColor",
      opacity: "0.7",
    }),
    [],
  );

  const handlePrimaryAction = useCallback(() => {
    if (props.onAction) {
      props.onAction();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [props.onAction]);

  const handleGoBack = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }, []);

  return createElement(
    "div",
    {
      role: "alert",
      "aria-live": "assertive",
      style: containerStyle,
    },
    // Watermark status code
    createElement(
      "div",
      { "aria-hidden": "true", style: watermarkStyle },
      String(props.statusCode),
    ),
    // Title
    createElement("h1", { style: titleStyle }, props.title),
    // Description
    props.description
      ? createElement("p", { style: descriptionStyle }, props.description)
      : null,
    // Primary action button
    createElement(
      "button",
      {
        type: "button",
        onClick: handlePrimaryAction,
        style: primaryButtonStyle,
      },
      actionLabel,
    ),
    // Optional "Go Back" link
    props.showGoBack
      ? createElement(
          "button",
          {
            type: "button",
            onClick: handleGoBack,
            style: goBackStyle,
          },
          "Go Back",
        )
      : null,
  );
}
