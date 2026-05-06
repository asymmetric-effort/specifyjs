# @specifyjs/errors-http-502

Bad Gateway (502) error page component for SpecifyJS.

## Usage

```ts
import { Http502 } from '@specifyjs/errors-http-502';

// With defaults
createElement(Http502, {});

// With overrides
createElement(Http502, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The server received an invalid response. Please try again later." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
