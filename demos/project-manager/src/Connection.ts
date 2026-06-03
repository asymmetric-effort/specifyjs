// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Connection.ts -- Re-exports the CardLinkOverlay from the reusable Board library.
 * The old ConnectionsOverlay is replaced by CardLinkOverlay.
 */

export { CardLinkOverlay as ConnectionsOverlay } from '../../../components/data/board/src/CardLink';
export type { CardLinkOverlayProps as ConnectionsOverlayProps } from '../../../components/data/board/src/CardLink';
