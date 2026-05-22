// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Accordion } from '../src/index';
import type { AccordionSection, AccordionProps } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';

function renderToContainer(element: unknown): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(element);
  return container;
}

function cleanup(container: HTMLElement) {
  document.body.removeChild(container);
}

async function tick() {
  await new Promise(r => setTimeout(r, 0));
}

const sampleSections: AccordionSection[] = [
  { id: 'sec-1', header: 'Section One', content: 'Content for section one' },
  { id: 'sec-2', header: 'Section Two', content: 'Content for section two' },
  { id: 'sec-3', header: 'Section Three', content: 'Content for section three' },
];

// -- Happy path tests -------------------------------------------------------

describe('Accordion', () => {
  describe('happy path', () => {
    it('renders all section headers', () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections }),
      );
      const headers = container.querySelectorAll('[aria-expanded]');
      expect(headers.length).toBe(3);
      expect(headers[0]!.textContent).toContain('Section One');
      expect(headers[1]!.textContent).toContain('Section Two');
      expect(headers[2]!.textContent).toContain('Section Three');
      cleanup(container);
    });

    it('renders with defaultExpanded sections', () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections, defaultExpanded: ['sec-1'] }),
      );
      const firstHeader = container.querySelector('[data-section-id="sec-1"]');
      expect(firstHeader!.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('expands a section on header click', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections }),
      );
      const header = container.querySelector('[data-section-id="sec-2"]') as HTMLElement;
      expect(header.getAttribute('aria-expanded')).toBe('false');
      header.click();
      await tick();
      expect(header.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('collapses an expanded section on header click', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections, defaultExpanded: ['sec-1'] }),
      );
      const header = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      expect(header.getAttribute('aria-expanded')).toBe('true');
      header.click();
      await tick();
      expect(header.getAttribute('aria-expanded')).toBe('false');
      cleanup(container);
    });

    it('supports multiple sections open when allowMultiple is true', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections, allowMultiple: true }),
      );
      const h1 = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      const h2 = container.querySelector('[data-section-id="sec-2"]') as HTMLElement;
      h1.click();
      await tick();
      h2.click();
      await tick();
      expect(h1.getAttribute('aria-expanded')).toBe('true');
      expect(h2.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('renders section icons', () => {
      const sections: AccordionSection[] = [
        { id: 's1', header: 'With Icon', content: 'body', icon: 'I' },
      ];
      const container = renderToContainer(
        createElement(Accordion, { sections }),
      );
      expect(container.textContent).toContain('I');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty sections array', () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: [] }),
      );
      const headers = container.querySelectorAll('[aria-expanded]');
      expect(headers.length).toBe(0);
      cleanup(container);
    });

    it('renders disabled sections as non-togglable', () => {
      const sections: AccordionSection[] = [
        { id: 'dis', header: 'Disabled', content: 'Hidden', disabled: true },
      ];
      const container = renderToContainer(
        createElement(Accordion, { sections }),
      );
      const header = container.querySelector('[data-section-id="dis"]') as HTMLElement;
      expect(header.getAttribute('aria-disabled')).toBe('true');
      header.click();
      expect(header.getAttribute('aria-expanded')).toBe('false');
      cleanup(container);
    });

    it('handles missing onChange callback', () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections }),
      );
      const header = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      expect(() => header.click()).not.toThrow();
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onChange with expanded IDs on toggle', async () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections, onChange }),
      );
      const header = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      header.click();
      await tick();
      expect(onChange).toHaveBeenCalledWith(['sec-1']);
      cleanup(container);
    });

    it('toggles via Enter key', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections }),
      );
      const header = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await tick();
      expect(header.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('toggles via Space key', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections }),
      );
      const header = container.querySelector('[data-section-id="sec-2"]') as HTMLElement;
      header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      await tick();
      expect(header.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('in single mode, expanding one collapses the other', async () => {
      const container = renderToContainer(
        createElement(Accordion, { sections: sampleSections, defaultExpanded: ['sec-1'] }),
      );
      const h1 = container.querySelector('[data-section-id="sec-1"]') as HTMLElement;
      const h2 = container.querySelector('[data-section-id="sec-2"]') as HTMLElement;
      expect(h1.getAttribute('aria-expanded')).toBe('true');
      h2.click();
      await tick();
      expect(h1.getAttribute('aria-expanded')).toBe('false');
      expect(h2.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });
  });
});
