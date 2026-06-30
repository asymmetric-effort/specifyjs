# BuildableList

**Category:** Form  
**Path:** `components/form/buildable-list`

## Overview

Reusable ordered string-list builder with add, edit, and delete. Internally uses a Set for deduplication while preserving insertion order.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` | *(required)* | Current list of strings (controlled). Internally a Set — no duplicates. |
| `onChange` | `(value: string[]) => void` | *(required)* | Called when the list changes (add, edit, delete). Returns the new list. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Orientation of the rendered list. |
| `inputPosition` | `'above' \| 'below'` | `'below'` | Where the text input appears when adding. |
| `delimiter` | `string` | `', '` (horizontal) / `'\n'` (vertical) | Delimiter shown between items in the rendered list. |
| `placeholder` | `string` | `'Add item...'` | Placeholder text for the input field. |
| `disabled` | `boolean` | `false` | Whether the control is disabled. |
| `label` | `string` | — | Label for the control. |
| `maxItems` | `number` | unlimited | Maximum number of items. |

## Usage

```typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { BuildableList } from 'specifyjs/components';

function TagEditor() {
  const [tags, setTags] = useState<string[]>(['typescript', 'specifyjs']);
  return createElement(BuildableList, {
    value: tags,
    onChange: setTags,
    label: 'Tags',
    placeholder: 'Add a tag...',
  });
}
```

## Behavior

1. A '+' button is always visible. Clicking it opens a text input for adding items.
2. Clicking an existing item opens it for editing with OK and X (delete) buttons.
3. Duplicate values are silently rejected (Set semantics).
4. Keyboard: Enter submits, Escape cancels, '+' key opens add input.
