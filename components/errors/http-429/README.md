# @specifyjs/errors-http-429

Too Many Requests (429) error page component for SpecifyJS.

## Usage

```ts
import { Http429 } from '@specifyjs/errors-http-429';

// With defaults
createElement(Http429, {});

// With overrides
createElement(Http429, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "You have sent too many requests. Please wait and try again." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
