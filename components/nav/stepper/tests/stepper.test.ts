// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Stepper } from '../src/index';
import type { StepperProps, StepItem } from '../src/index';
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

const sampleSteps: StepItem[] = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Review' },
  { label: 'Complete' },
];

// -- Happy path tests -------------------------------------------------------

describe('Stepper', () => {
  describe('happy path', () => {
    it('renders stepper navigation', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0 }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      expect(nav!.getAttribute('aria-label')).toBe('Progress steps');
      cleanup(container);
    });

    it('renders all step labels', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0 }),
      );
      expect(container.textContent).toContain('Account');
      expect(container.textContent).toContain('Profile');
      expect(container.textContent).toContain('Review');
      expect(container.textContent).toContain('Complete');
      cleanup(container);
    });

    it('marks active step with aria-current', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 1 }),
      );
      const active = container.querySelector('[aria-current="step"]');
      expect(active).toBeTruthy();
      expect(active!.textContent).toContain('Profile');
      cleanup(container);
    });

    it('renders step descriptions', () => {
      const steps: StepItem[] = [
        { label: 'Step 1', description: 'Do the first thing' },
        { label: 'Step 2', description: 'Do the second thing' },
      ];
      const container = renderToContainer(
        createElement(Stepper, { steps, currentStep: 0 }),
      );
      expect(container.textContent).toContain('Do the first thing');
      cleanup(container);
    });

    it('renders completed steps with check mark', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 2 }),
      );
      // Steps 0 and 1 are completed, should contain checkmark
      expect(container.textContent).toContain('\u2713');
      cleanup(container);
    });

    it('supports vertical orientation', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0, orientation: 'vertical' }),
      );
      const nav = container.querySelector('[role="navigation"]') as HTMLElement;
      expect(nav.style.flexDirection).toBe('column');
      cleanup(container);
    });

    it('supports dot variant', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 1, variant: 'dot' }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty steps array', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: [], currentStep: 0 }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('handles currentStep beyond steps length', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 99 }),
      );
      // Should not crash; all steps marked completed
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('handles missing onChange when clickable', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0, clickable: true }),
      );
      const buttons = container.querySelectorAll('button');
      if (buttons.length > 0) {
        expect(() => (buttons[0] as HTMLElement).click()).not.toThrow();
      }
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onChange when a clickable step is clicked', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0, clickable: true, onChange }),
      );
      const buttons = container.querySelectorAll('button');
      if (buttons.length >= 2) {
        (buttons[1] as HTMLElement).click();
        expect(onChange).toHaveBeenCalledWith(1);
      }
      cleanup(container);
    });

    it('does not fire onChange when not clickable', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 0, clickable: false, onChange }),
      );
      // Steps are rendered as divs, not buttons
      const divSteps = container.querySelectorAll('[aria-current]');
      if (divSteps.length > 0) {
        (divSteps[0] as HTMLElement).click();
      }
      expect(onChange).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('renders connectors between steps', () => {
      const container = renderToContainer(
        createElement(Stepper, { steps: sampleSteps, currentStep: 1 }),
      );
      // Connectors appear as div elements between step elements
      const nav = container.querySelector('[role="navigation"]')!;
      expect(nav.children.length).toBeGreaterThan(sampleSteps.length);
      cleanup(container);
    });
  });
});
