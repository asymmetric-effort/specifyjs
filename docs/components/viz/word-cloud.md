# WordCloud

Word cloud visualization rendered as SVG. Font size is proportional to word weight, with spiral placement to avoid overlaps.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| words | `WordDatum[]` | `[]` | Array of words with weights |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| minFontSize | `number` | `10` | Minimum font size in px |
| maxFontSize | `number` | `64` | Maximum font size in px |
| fontFamily | `string` | `'sans-serif'` | Font family |
| colors | `string[]` | built-in palette | Color palette |
| rotations | `number[]` | `[0, -45, 45, 90]` | Allowed rotation angles in degrees |
| padding | `number` | `4` | Padding between words in px |
| spiral | `'archimedean' \| 'rectangular'` | `'archimedean'` | Spiral placement algorithm |
| title | `string` | `undefined` | Chart title |

### WordDatum

| Field | Type | Description |
|-------|------|-------------|
| text | `string` | Word text |
| weight | `number` | Word weight (determines font size) |
| color | `string` | Optional fill color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { WordCloud } from 'specifyjs/components/viz/word-cloud';

createElement(WordCloud, {
  words: [
    { text: 'JavaScript', weight: 100 },
    { text: 'TypeScript', weight: 80 },
    { text: 'SpecifyJS', weight: 90 },
    { text: 'SVG', weight: 50 },
    { text: 'Canvas', weight: 40 },
  ],
  title: 'Technology Cloud',
});
```

## Notes

- Renders as SVG. Placement is deterministic for the same input.
- Words are placed largest-first using a spiral outward from center.
- Word width is estimated using character count (since DOM text measurement is unavailable during pre-rendering).
- Words that cannot be placed without overlap or going out of bounds are gracefully skipped.
- Rotation is assigned per-word using a deterministic hash of the word text.
