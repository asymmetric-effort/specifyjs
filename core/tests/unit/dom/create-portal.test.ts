import { describe, it, expect } from 'vitest';
import { createPortal } from '../../../src/dom/create-portal';
import { createElement } from '../../../src/index';
import { SPEC_ELEMENT_TYPE, SPEC_PORTAL_TYPE } from '../../../src/shared/types';

describe('createPortal', () => {
  it('creates a portal element', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal(createElement('span', null, 'portal content'), portalContainer);
    expect(portal.$$typeof).toBe(SPEC_ELEMENT_TYPE);
    expect(portal.type).toBe(SPEC_PORTAL_TYPE);
  });

  it('stores children and container in props', () => {
    const portalContainer = document.createElement('div');
    const child = createElement('span', null, 'child');
    const portal = createPortal(child, portalContainer);
    expect((portal.props as Record<string, unknown>).children).toBe(child);
    expect((portal.props as Record<string, unknown>).container).toBe(portalContainer);
  });

  it('accepts an optional key', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal('text', portalContainer, 'portal-key');
    expect(portal.key).toBe('portal-key');
  });

  it('defaults key to null', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal('text', portalContainer);
    expect(portal.key).toBeNull();
  });

  it('sets ref to null', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal('text', portalContainer);
    expect(portal.ref).toBeNull();
  });

  it('handles string children', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal('just text', portalContainer);
    expect((portal.props as Record<string, unknown>).children).toBe('just text');
  });

  it('handles null children', () => {
    const portalContainer = document.createElement('div');
    const portal = createPortal(null, portalContainer);
    expect((portal.props as Record<string, unknown>).children).toBeNull();
  });
});
