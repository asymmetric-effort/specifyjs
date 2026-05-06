# @specifyjs/errors-http-403

Forbidden (403) error page component for SpecifyJS.

## Usage

```ts
import { Http403 } from '@specifyjs/errors-http-403';

// With defaults
createElement(Http403, {});

// With overrides
createElement(Http403, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "You do not have permission to access this resource." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
