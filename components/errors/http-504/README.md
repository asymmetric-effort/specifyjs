# @specifyjs/errors-http-504

Gateway Timeout (504) error page component for SpecifyJS.

## Usage

```ts
import { Http504 } from '@specifyjs/errors-http-504';

// With defaults
createElement(Http504, {});

// With overrides
createElement(Http504, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The server did not respond in time. Please try again later." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
