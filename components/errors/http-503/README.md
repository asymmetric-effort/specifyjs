# @specifyjs/errors-http-503

Service Unavailable (503) error page component for SpecifyJS.

## Usage

```ts
import { Http503 } from '@specifyjs/errors-http-503';

// With defaults
createElement(Http503, {});

// With overrides
createElement(Http503, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The service is temporarily unavailable. Please try again later." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
