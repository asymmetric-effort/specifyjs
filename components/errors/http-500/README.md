# @specifyjs/errors-http-500

Internal Server Error (500) error page component for SpecifyJS.

## Usage

```ts
import { Http500 } from '@specifyjs/errors-http-500';

// With defaults
createElement(Http500, {});

// With overrides
createElement(Http500, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "Something went wrong on the server. Please try again later." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
