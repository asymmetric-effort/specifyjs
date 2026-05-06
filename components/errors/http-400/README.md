# @specifyjs/errors-http-400

Bad Request (400) error page component for SpecifyJS.

## Usage

```ts
import { Http400 } from '@specifyjs/errors-http-400';

// With defaults
createElement(Http400, {});

// With overrides
createElement(Http400, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The request could not be understood. Please check your input." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
