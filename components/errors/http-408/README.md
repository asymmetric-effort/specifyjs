# @specifyjs/errors-http-408

Request Timeout (408) error page component for SpecifyJS.

## Usage

```ts
import { Http408 } from '@specifyjs/errors-http-408';

// With defaults
createElement(Http408, {});

// With overrides
createElement(Http408, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The server timed out waiting for the request. Please try again." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
