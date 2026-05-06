# @specifyjs/errors-http-401

Unauthorized (401) error page component for SpecifyJS.

## Usage

```ts
import { Http401 } from '@specifyjs/errors-http-401';

// With defaults
createElement(Http401, {});

// With overrides
createElement(Http401, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "You must sign in to access this page." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
