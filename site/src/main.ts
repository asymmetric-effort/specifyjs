// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement, setComponentIdsEnabled } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { App } from './app';

setComponentIdsEnabled(true);

// Detect system dark mode preference and apply before first render
if (typeof window !== 'undefined') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

  // Listen for system theme changes (unless user manually toggled)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (document.documentElement.getAttribute('data-theme-manual') !== 'true') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

const root = createRoot(document.getElementById('root')!);
root.render(createElement(App, null));

// Remove <noscript> SEO fallback after SPA mounts — frees parsed DOM from memory
document.querySelector('noscript')?.remove();
