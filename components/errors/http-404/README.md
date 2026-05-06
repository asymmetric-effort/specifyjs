# @specifyjs/errors-http-404

Not Found (404) error page component for SpecifyJS.

## Usage

```ts
import { Http404 } from '@specifyjs/errors-http-404';

// With defaults
createElement(Http404, {});

// With overrides
createElement(Http404, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The page you are looking for does not exist or has been moved." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
