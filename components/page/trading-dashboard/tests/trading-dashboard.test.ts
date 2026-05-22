// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { TradingDashboard } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

function render(vnode: unknown): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

beforeEach(() => {
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

describe('TradingDashboard', () => {
  it('renders without error', () => {
    const el = render(createElement(TradingDashboard, null));
    expect(el.querySelector('.trading-dashboard')).not.toBeNull();
  });

  it('contains header bar', () => {
    const el = render(createElement(TradingDashboard, null));
    const header = el.querySelector('.trading-dashboard__header');
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain('SpecifyJS Trading Platform');
  });

  it('contains price chart area', () => {
    const el = render(createElement(TradingDashboard, null));
    const chart = el.querySelector('[role="img"]');
    expect(chart).not.toBeNull();
    expect(chart?.getAttribute('aria-label')).toBe('Price chart');
  });

  it('contains order book', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('Order Book');
  });

  it('contains watchlist', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('Watchlist');
  });

  it('contains positions table', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('Positions');
  });

  it('contains recent trades', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('Recent Trades');
  });

  it('contains market depth visualization', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('Market Depth');
  });

  it('has ticker symbols in watchlist', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    expect(text).toContain('AAPL');
    expect(text).toContain('GOOGL');
    expect(text).toContain('MSFT');
    expect(text).toContain('TSLA');
    expect(text).toContain('NVDA');
  });

  it('has bid/ask data in order book', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid');
    const text = grid?.textContent ?? '';
    // Bid and ask prices from mock data
    expect(text).toContain('189.40');
    expect(text).toContain('189.44');
    expect(text).toContain('Bid Price');
    expect(text).toContain('Ask Price');
  });

  it('applies className', () => {
    const el = render(createElement(TradingDashboard, { className: 'custom-td' }));
    const root = el.querySelector('.trading-dashboard');
    expect(root?.classList.contains('custom-td')).toBe(true);
  });

  it('header shows account info', () => {
    const el = render(createElement(TradingDashboard, null));
    const header = el.querySelector('.trading-dashboard__header');
    const text = header?.textContent ?? '';
    expect(text).toContain('Account');
    expect(text).toContain('Balance');
  });

  it('grid uses CSS grid layout', () => {
    const el = render(createElement(TradingDashboard, null));
    const grid = el.querySelector('.trading-dashboard__grid') as HTMLElement;
    expect(grid.style.display).toBe('grid');
    expect(grid.style.gridTemplateColumns).toBe('1fr 1fr 1fr');
  });
});
