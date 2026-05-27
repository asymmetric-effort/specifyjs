// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TradingDashboard -- Full-screen layout resembling a stock trading terminal.
 *
 * Features a header bar, and a 3x2 CSS grid containing: price chart (SVG),
 * order book, watchlist, position summary, recent trades, and market depth
 * visualization. Uses useState for a simulated price ticker.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useMemo, useCallback } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TradingDashboardProps {
  /** Extra class name */
  className?: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const WATCHLIST = [
  { symbol: 'AAPL', price: 189.42, change: 1.23, volume: 52300000, spark: [186, 187, 188, 187, 189] },
  { symbol: 'GOOGL', price: 141.80, change: -0.87, volume: 23100000, spark: [143, 142, 141, 142, 141] },
  { symbol: 'MSFT', price: 378.91, change: 2.45, volume: 18700000, spark: [375, 376, 378, 377, 379] },
  { symbol: 'AMZN', price: 185.63, change: -1.12, volume: 31400000, spark: [187, 186, 186, 185, 185] },
  { symbol: 'TSLA', price: 248.50, change: 3.78, volume: 67200000, spark: [244, 245, 247, 246, 249] },
  { symbol: 'NVDA', price: 875.30, change: 12.50, volume: 41800000, spark: [860, 865, 870, 868, 876] },
];

const ORDER_BOOK_BIDS = [
  { price: 189.40, qty: 1200 },
  { price: 189.38, qty: 3400 },
  { price: 189.35, qty: 800 },
  { price: 189.32, qty: 5600 },
  { price: 189.30, qty: 2100 },
  { price: 189.28, qty: 4300 },
];

const ORDER_BOOK_ASKS = [
  { price: 189.44, qty: 900 },
  { price: 189.47, qty: 2200 },
  { price: 189.50, qty: 1500 },
  { price: 189.53, qty: 3800 },
  { price: 189.55, qty: 1100 },
  { price: 189.58, qty: 2700 },
];

const POSITIONS = [
  { symbol: 'AAPL', qty: 100, avgPrice: 185.20, currentPrice: 189.42, pnl: 422.00 },
  { symbol: 'MSFT', qty: 50, avgPrice: 382.10, currentPrice: 378.91, pnl: -159.50 },
  { symbol: 'NVDA', qty: 25, avgPrice: 850.00, currentPrice: 875.30, pnl: 632.50 },
];

const RECENT_TRADES = [
  { time: '14:32:01', symbol: 'AAPL', side: 'BUY', qty: 50, price: 189.42 },
  { time: '14:31:45', symbol: 'MSFT', side: 'SELL', qty: 25, price: 378.95 },
  { time: '14:30:22', symbol: 'TSLA', side: 'BUY', qty: 100, price: 247.80 },
  { time: '14:29:58', symbol: 'NVDA', side: 'BUY', qty: 10, price: 874.50 },
  { time: '14:28:33', symbol: 'GOOGL', side: 'SELL', qty: 75, price: 142.10 },
];

const CHART_DATA = [
  185.20, 186.10, 185.80, 187.50, 188.20, 187.90, 186.50, 187.80,
  188.40, 189.10, 188.60, 187.20, 188.50, 189.80, 189.20, 188.90,
  189.50, 190.10, 189.40, 188.80, 189.60, 190.30, 189.90, 189.42,
];

const DEPTH_BIDS = [
  { price: 189.40, volume: 1200 },
  { price: 189.35, volume: 3400 },
  { price: 189.30, volume: 2800 },
  { price: 189.25, volume: 5100 },
  { price: 189.20, volume: 4200 },
];

const DEPTH_ASKS = [
  { price: 189.45, volume: 900 },
  { price: 189.50, volume: 2600 },
  { price: 189.55, volume: 1800 },
  { price: 189.60, volume: 4400 },
  { price: 189.65, volume: 3100 },
];

// Time axis labels for chart
const TIME_LABELS = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVolume(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatWithCommas(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPrice(n: number): string {
  return n.toFixed(2);
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cellStyle: Record<string, string> = {
  backgroundColor: '#1a1a2e',
  borderRadius: '4px',
  padding: '12px',
  border: '1px solid #2a2a4a',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const cellTitleStyle: Record<string, string> = {
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#8888aa',
  marginBottom: '8px',
  flexShrink: '0',
};

const tableStyle: Record<string, string> = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
};

const thStyle: Record<string, string> = {
  textAlign: 'left',
  padding: '4px 6px',
  borderBottom: '1px solid #2a2a4a',
  color: '#8888aa',
  fontWeight: '600',
  fontSize: '11px',
};

const tdStyle: Record<string, string> = {
  padding: '3px 6px',
  borderBottom: '1px solid #16162a',
  color: '#ccccdd',
  fontSize: '12px',
};

const hoverRowStyle: Record<string, string> = {
  cursor: 'default',
  transition: 'background-color 0.1s',
};

// ---------------------------------------------------------------------------
// Sparkline builder
// ---------------------------------------------------------------------------

function buildSparkline(data: Array<number>, isPositive: boolean): unknown {
  const w = 40;
  const h = 14;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const color = isPositive ? '#00c853' : '#ff1744';

  return createElement(
    'svg',
    {
      viewBox: `0 0 ${w} ${h}`,
      style: {
        width: '40px',
        height: '14px',
        display: 'inline-block',
        verticalAlign: 'middle',
        marginLeft: '4px',
      },
      'aria-hidden': 'true',
    },
    createElement('polyline', {
      points,
      fill: 'none',
      stroke: color,
      strokeWidth: '1.5',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function buildPriceChart(data: Array<number>, currentPrice: number): unknown {
  const width = 360;
  const height = 160;
  const padX = 40;  // more room for Y axis labels
  const padY = 15;
  const padBottom = 25; // room for X axis labels
  const chartHeight = height - padY - padBottom;
  const chartWidth = width - padX - 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = chartWidth / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * chartHeight;
    return { x, y };
  });

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Area fill path (polygon under the line)
  const areaPath = `M${padX},${padY + chartHeight} ` +
    points.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
    ` L${points[points.length - 1].x.toFixed(1)},${padY + chartHeight} Z`;

  // Line segments colored green/red
  const segments: Array<unknown> = [];
  for (let i = 1; i < data.length; i++) {
    const color = data[i] >= data[i - 1] ? '#00c853' : '#ff1744';
    segments.push(
      createElement('line', {
        key: String(i),
        x1: String(points[i - 1].x.toFixed(1)),
        y1: String(points[i - 1].y.toFixed(1)),
        x2: String(points[i].x.toFixed(1)),
        y2: String(points[i].y.toFixed(1)),
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
      }),
    );
  }

  // Horizontal grid lines with price labels (5 lines)
  const gridLines: Array<unknown> = [];
  for (let i = 0; i < 5; i++) {
    const y = padY + (i / 4) * chartHeight;
    const priceVal = max - (i / 4) * range;
    gridLines.push(
      createElement('line', {
        key: `g${i}`,
        x1: String(padX),
        y1: String(y.toFixed(1)),
        x2: String(width - 10),
        y2: String(y.toFixed(1)),
        stroke: '#2a2a4a',
        strokeWidth: '0.5',
        strokeDasharray: '3,3',
      }),
    );
    // Y axis price label
    gridLines.push(
      createElement('text', {
        key: `yl${i}`,
        x: String(padX - 4),
        y: String((y + 3).toFixed(1)),
        fill: '#6666aa',
        fontSize: '8',
        textAnchor: 'end',
        fontFamily: 'monospace',
      }, formatPrice(priceVal)),
    );
  }

  // X axis time labels
  const timeLabels: Array<unknown> = [];
  const labelCount = Math.min(TIME_LABELS.length, data.length);
  const labelStep = (data.length - 1) / (labelCount - 1);
  for (let i = 0; i < labelCount; i++) {
    const idx = Math.round(i * labelStep);
    const x = padX + idx * stepX;
    timeLabels.push(
      createElement('text', {
        key: `tl${i}`,
        x: String(x.toFixed(1)),
        y: String(height - 4),
        fill: '#6666aa',
        fontSize: '8',
        textAnchor: 'middle',
        fontFamily: 'monospace',
      }, TIME_LABELS[i]),
    );
  }

  // Gradient definition for area fill
  const gradientId = 'chartGrad';

  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle },
      'AAPL ',
      createElement('span', { style: { color: '#00c853', fontSize: '14px', fontWeight: '700' } }, `$${formatPrice(currentPrice)}`),
      createElement('span', { style: { color: '#00c853', fontSize: '11px', marginLeft: '8px' } }, '+1.23%'),
    ),
    createElement(
      'svg',
      {
        viewBox: `0 0 ${width} ${height}`,
        style: { width: '100%', flex: '1', minHeight: '0' },
        'aria-label': 'Price chart',
        role: 'img',
      },
      // Gradient definition
      createElement(
        'defs',
        null,
        createElement(
          'linearGradient',
          { id: gradientId, x1: '0', y1: '0', x2: '0', y2: '1' },
          createElement('stop', { offset: '0%', stopColor: '#00c853', stopOpacity: '0.3' }),
          createElement('stop', { offset: '100%', stopColor: '#00c853', stopOpacity: '0.02' }),
        ),
      ),
      // Area fill under the line
      createElement('path', {
        d: areaPath,
        fill: `url(#${gradientId})`,
      }),
      // Grid lines + labels
      ...gridLines,
      // Time labels
      ...timeLabels,
      // Price line segments (colored)
      ...segments,
      // Current price dotted line
      createElement('line', {
        x1: String(padX),
        y1: String((padY + (1 - (currentPrice - min) / range) * chartHeight).toFixed(1)),
        x2: String(width - 10),
        y2: String((padY + (1 - (currentPrice - min) / range) * chartHeight).toFixed(1)),
        stroke: '#00c853',
        strokeWidth: '0.5',
        strokeDasharray: '4,2',
        opacity: '0.6',
      }),
    ),
  );
}

function buildOrderBook(): unknown {
  const maxQty = Math.max(
    ...ORDER_BOOK_BIDS.map((b) => b.qty),
    ...ORDER_BOOK_ASKS.map((a) => a.qty),
  );

  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle }, 'Order Book'),
    createElement(
      'table',
      { style: tableStyle },
      createElement(
        'thead',
        null,
        createElement(
          'tr',
          null,
          createElement('th', { style: thStyle }, 'Bid Price'),
          createElement('th', { style: thStyle }, 'Qty'),
          createElement('th', { style: thStyle }, 'Ask Price'),
          createElement('th', { style: thStyle }, 'Qty'),
        ),
      ),
      createElement(
        'tbody',
        null,
        ...ORDER_BOOK_BIDS.map((bid, i) => {
          const ask = ORDER_BOOK_ASKS[i];
          const bidIntensity = (bid.qty / maxQty) * 0.25;
          const askIntensity = ((ask?.qty ?? 0) / maxQty) * 0.25;
          return createElement(
            'tr',
            {
              key: String(i),
              style: hoverRowStyle,
            },
            createElement('td', {
              style: {
                ...tdStyle,
                color: '#00c853',
                backgroundColor: `rgba(0,200,83,${bidIntensity.toFixed(3)})`,
                fontFamily: 'monospace',
              },
            }, formatPrice(bid.price)),
            createElement('td', {
              style: {
                ...tdStyle,
                backgroundColor: `rgba(0,200,83,${(bidIntensity * 0.5).toFixed(3)})`,
                fontFamily: 'monospace',
              },
            }, formatWithCommas(bid.qty)),
            createElement('td', {
              style: {
                ...tdStyle,
                color: '#ff1744',
                backgroundColor: `rgba(255,23,68,${askIntensity.toFixed(3)})`,
                fontFamily: 'monospace',
              },
            }, ask ? formatPrice(ask.price) : ''),
            createElement('td', {
              style: {
                ...tdStyle,
                backgroundColor: `rgba(255,23,68,${(askIntensity * 0.5).toFixed(3)})`,
                fontFamily: 'monospace',
              },
            }, ask ? formatWithCommas(ask.qty) : ''),
          );
        }),
      ),
    ),
  );
}

function buildWatchlist(priceOffset: number): unknown {
  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle }, 'Watchlist'),
    createElement(
      'table',
      { style: tableStyle },
      createElement(
        'thead',
        null,
        createElement(
          'tr',
          null,
          createElement('th', { style: thStyle }, 'Symbol'),
          createElement('th', { style: thStyle }, 'Price'),
          createElement('th', { style: thStyle }, 'Chg%'),
          createElement('th', { style: thStyle }, 'Volume'),
        ),
      ),
      createElement(
        'tbody',
        null,
        ...WATCHLIST.map((item, i) => {
          const adjustedPrice = item.price + (i === 0 ? priceOffset : 0);
          const isPositive = item.change >= 0;
          return createElement(
            'tr',
            {
              key: String(i),
              style: hoverRowStyle,
            },
            createElement('td', { style: { ...tdStyle, fontWeight: '600', color: '#ffffff' } },
              item.symbol,
              buildSparkline(item.spark, isPositive),
            ),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace' } }, formatPrice(adjustedPrice)),
            createElement('td', {
              style: { ...tdStyle, color: isPositive ? '#00c853' : '#ff1744', fontWeight: '600' },
            }, `${isPositive ? '+' : ''}${formatPrice(item.change)}%`),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace', color: '#8888aa' } }, formatVolume(item.volume)),
          );
        }),
      ),
    ),
  );
}

function buildPositions(): unknown {
  const totalPnl = POSITIONS.reduce((sum, p) => sum + p.pnl, 0);
  const totalPositive = totalPnl >= 0;

  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle },
      'Positions',
      createElement('span', {
        style: {
          marginLeft: '12px',
          color: totalPositive ? '#00c853' : '#ff1744',
          fontWeight: '700',
          fontSize: '12px',
        },
      }, `${totalPositive ? '+' : ''}$${formatPrice(totalPnl)}`),
    ),
    createElement(
      'table',
      { style: tableStyle },
      createElement(
        'thead',
        null,
        createElement(
          'tr',
          null,
          createElement('th', { style: thStyle }, 'Symbol'),
          createElement('th', { style: thStyle }, 'Qty'),
          createElement('th', { style: thStyle }, 'Avg'),
          createElement('th', { style: thStyle }, 'P&L'),
        ),
      ),
      createElement(
        'tbody',
        null,
        ...POSITIONS.map((pos, i) => {
          const isPositive = pos.pnl >= 0;
          return createElement(
            'tr',
            {
              key: String(i),
              style: {
                ...hoverRowStyle,
                backgroundColor: isPositive
                  ? 'rgba(0,200,83,0.04)'
                  : 'rgba(255,23,68,0.04)',
              },
            },
            createElement('td', { style: { ...tdStyle, fontWeight: '600', color: '#ffffff' } }, pos.symbol),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace' } }, String(pos.qty)),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace' } }, formatPrice(pos.avgPrice)),
            createElement('td', {
              style: {
                ...tdStyle,
                color: isPositive ? '#00c853' : '#ff1744',
                fontWeight: '700',
                fontFamily: 'monospace',
              },
            }, `${isPositive ? '+' : ''}$${formatPrice(pos.pnl)}`),
          );
        }),
      ),
    ),
  );
}

function buildRecentTrades(): unknown {
  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle }, 'Recent Trades'),
    createElement(
      'table',
      { style: tableStyle },
      createElement(
        'thead',
        null,
        createElement(
          'tr',
          null,
          createElement('th', { style: thStyle }, 'Time'),
          createElement('th', { style: thStyle }, 'Sym'),
          createElement('th', { style: thStyle }, 'Side'),
          createElement('th', { style: thStyle }, 'Qty'),
          createElement('th', { style: thStyle }, 'Price'),
        ),
      ),
      createElement(
        'tbody',
        null,
        ...RECENT_TRADES.map((trade, i) => {
          const isBuy = trade.side === 'BUY';
          return createElement(
            'tr',
            {
              key: String(i),
              style: hoverRowStyle,
            },
            createElement('td', { style: { ...tdStyle, color: '#8888aa', fontFamily: 'monospace' } }, trade.time),
            createElement('td', { style: { ...tdStyle, fontWeight: '600', color: '#ffffff' } }, trade.symbol),
            createElement('td', {
              style: { ...tdStyle, color: isBuy ? '#00c853' : '#ff1744', fontWeight: '600' },
            }, trade.side),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace' } }, formatWithCommas(trade.qty)),
            createElement('td', { style: { ...tdStyle, fontFamily: 'monospace' } }, formatPrice(trade.price)),
          );
        }),
      ),
    ),
  );
}

function buildMarketDepth(): unknown {
  const maxVolume = Math.max(
    ...DEPTH_BIDS.map((b) => b.volume),
    ...DEPTH_ASKS.map((a) => a.volume),
  );

  const barHeight = '16px';

  return createElement(
    'div',
    { style: cellStyle },
    createElement('div', { style: cellTitleStyle }, 'Market Depth'),
    createElement(
      'div',
      { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' } },
      // Bids (green, left-aligned)
      ...DEPTH_BIDS.map((bid, i) =>
        createElement(
          'div',
          {
            key: `b${i}`,
            style: { display: 'flex', alignItems: 'center', gap: '6px' },
          },
          createElement('span', { style: { width: '52px', fontSize: '11px', color: '#8888aa', textAlign: 'right', fontFamily: 'monospace' } }, formatPrice(bid.price)),
          createElement('div', {
            style: {
              height: barHeight,
              width: `${(bid.volume / maxVolume) * 100}%`,
              backgroundColor: '#00c853',
              opacity: '0.6',
              borderRadius: '2px',
              maxWidth: '60%',
              transition: 'width 0.3s',
            },
          }),
          createElement('span', { style: { fontSize: '11px', color: '#ccccdd', fontFamily: 'monospace' } }, formatWithCommas(bid.volume)),
        ),
      ),
      // Separator
      createElement('div', { style: { height: '1px', backgroundColor: '#2a2a4a', margin: '4px 0' } }),
      // Asks (red, left-aligned)
      ...DEPTH_ASKS.map((ask, i) =>
        createElement(
          'div',
          {
            key: `a${i}`,
            style: { display: 'flex', alignItems: 'center', gap: '6px' },
          },
          createElement('span', { style: { width: '52px', fontSize: '11px', color: '#8888aa', textAlign: 'right', fontFamily: 'monospace' } }, formatPrice(ask.price)),
          createElement('div', {
            style: {
              height: barHeight,
              width: `${(ask.volume / maxVolume) * 100}%`,
              backgroundColor: '#ff1744',
              opacity: '0.6',
              borderRadius: '2px',
              maxWidth: '60%',
              transition: 'width 0.3s',
            },
          }),
          createElement('span', { style: { fontSize: '11px', color: '#ccccdd', fontFamily: 'monospace' } }, formatWithCommas(ask.volume)),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TradingDashboard(props: TradingDashboardProps) {
  const [priceOffset, setPriceOffset] = useState(0);
  const [clockTime, setClockTime] = useState('--:--:--');
  const [liveVisible, setLiveVisible] = useState(true);

  // Price ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceOffset((_prev: number) => {
        const delta = (Math.random() - 0.5) * 0.5;
        return Math.round(delta * 100) / 100;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Live clock effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClockTime(`${h}:${m}:${s}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Blinking LIVE indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisible((prev: boolean) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const containerStyle = useMemo<Record<string, string>>(() => ({
    width: '100%',
    height: '100%',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    color: '#ccccdd',
    backgroundColor: '#0d0d1a',
    overflow: 'hidden',
  }), []);

  const headerStyle: Record<string, string> = {
    height: '40px',
    backgroundColor: '#12122a',
    borderBottom: '1px solid #2a2a4a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    flexShrink: '0',
  };

  const headerTitleStyle: Record<string, string> = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const gridStyle: Record<string, string> = {
    flex: '1',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '8px',
    padding: '8px',
    overflow: 'hidden',
  };

  const currentPrice = 189.42 + priceOffset;

  // LIVE dot style
  const liveDotStyle: Record<string, string> = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00c853',
    display: 'inline-block',
    marginRight: '4px',
    opacity: liveVisible ? '1' : '0.3',
    transition: 'opacity 0.3s',
  };

  return createElement(
    'div',
    {
      className: `trading-dashboard ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Header
    createElement(
      'header',
      { className: 'trading-dashboard__header', style: headerStyle },
      createElement('span', { style: headerTitleStyle },
        'SpecifyJS Trading Platform',
        createElement('span', {
          style: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
            color: '#00c853',
            fontWeight: '600',
            marginLeft: '8px',
          },
        },
          createElement('span', { style: liveDotStyle }),
          'LIVE',
        ),
      ),
      createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' } },
        createElement('span', { style: { color: '#ffffff', fontFamily: 'monospace', fontWeight: '600', fontSize: '13px' } }, clockTime),
        createElement('span', { style: { color: '#8888aa' } }, 'Account: SJS-28401'),
        createElement('span', { style: { color: '#00c853' } }, 'Balance: $124,582.30'),
        createElement('span', { style: { color: '#8888aa' } }, 'Status: Connected'),
      ),
    ),
    // Grid
    createElement(
      'div',
      { className: 'trading-dashboard__grid', style: gridStyle },
      buildPriceChart(CHART_DATA, currentPrice),
      buildOrderBook(),
      buildWatchlist(priceOffset),
      buildPositions(),
      buildRecentTrades(),
      buildMarketDepth(),
    ),
  );
}
