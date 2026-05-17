# @specifyjs/nav-dock

A configurable vertical or horizontal icon bar component that displays application launchers with active/running indicators, badges, tooltips, and click-to-open behavior. Inspired by the Ubuntu Unity launcher and macOS dock.

## Usage

```typescript
import { Dock } from '@specifyjs/nav-dock';
import { createElement } from 'specifyjs';

const items = [
  { id: 'files', icon: 'F', label: 'Files', active: true },
  { id: 'terminal', icon: 'T', label: 'Terminal' },
  { id: 'mail', icon: 'M', label: 'Mail', badge: 3 },
];

createElement(Dock, {
  items,
  orientation: 'vertical',
  position: 'left',
  onItemClick: (id) => console.log('Clicked', id),
});
```
