# Getting Started

## Prerequisites

- Node.js 24+
- npm 10+

## Installation

```bash
cd core
npm install
```

## Create Your First Component

SpecifyJS uses `createElement` (or JSX) to describe UI:

```typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { createRoot } from 'specifyjs/dom';

function App() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('h1', null, `Count: ${count}`),
    createElement('button', {
      onClick: () => setCount(count + 1)
    }, 'Increment'),
  );
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
```

## Development Server

Start the Vite dev server for hot-reloading:

```bash
npx vite --port 3000
```

## Build for Production

```bash
npm run build
```

Output lands in `dist/` with ESM and CJS bundles.

## Run Tests

```bash
npm test              # Unit + integration (465 tests)
npm run test:e2e      # Playwright browser tests (27 tests)
npm run test:coverage # Tests with coverage report
```

## Next Steps

- [Core Concepts](core-concepts.md) — Components, props, state
- [Hooks API](../api/hooks.md) — All 16 hooks
- [Building SPAs](building-spas.md) — SPA patterns and examples
