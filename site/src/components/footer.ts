// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { Footer as FooterComponent } from '../../../components/layout/footer/src/index';

declare const __SPECIFYJS_VERSION__: string;
const VERSION = __SPECIFYJS_VERSION__;

export function Footer() {
  const year = new Date().getFullYear();

  const left = createElement(
    'span',
    null,
    `SpecifyJS v${VERSION}`,
  );

  const center = createElement(
    'span',
    null,
    `\u00a9 2025-${year} `,
    createElement(
      'a',
      {
        href: 'https://asymmetric-effort.com',
        style: { color: '#3b82f6', textDecoration: 'none' },
      },
      'Asymmetric Effort, LLC',
    ),
    '. MIT License.',
  );

  const right = createElement(
    'a',
    {
      href: 'https://github.com/asymmetric-effort/specifyjs',
      style: { color: '#3b82f6', textDecoration: 'none' },
    },
    'GitHub Repository',
  );

  return createElement(FooterComponent, { left, center, right });
}
