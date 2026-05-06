# @specifyjs/errors-http-405

Method Not Allowed (405) error page component for SpecifyJS.

## Usage

```ts
import { Http405 } from '@specifyjs/errors-http-405';

// With defaults
createElement(Http405, {});

// With overrides
createElement(Http405, {
  description: 'Custom message.',
  actionLabel: 'Try Again',
  onAction: () => location.reload(),
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| description | string | "The request method is not supported for this resource." | Override description |
| actionLabel | string | "Go Home" | Override button label |
| onAction | () => void | navigate('/') | Override button action |
