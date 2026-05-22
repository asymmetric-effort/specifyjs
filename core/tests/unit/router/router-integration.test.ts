/**
 * Integration tests for Router, Route, and Link components.
 * Tests the full routing system rendered with createRoot.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { Router } from '../../../src/router/router-component';
import { Route } from '../../../src/router/route-component';
import { Link } from '../../../src/router/link-component';
import { useRouter } from '../../../src/router/use-router';
import { useParams } from '../../../src/router/use-params';
import { useNavigate } from '../../../src/router/use-navigate';
import { navigate, __resetSnapshot } from '../../../src/router/router-store';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  window.location.hash = '';
  __resetSnapshot();
  return () => {
    document.body.removeChild(container);
    window.location.hash = '';
    __resetSnapshot();
  };
});

function Home() {
  return createElement('div', { id: 'home' }, 'Home Page');
}

function About() {
  return createElement('div', { id: 'about' }, 'About Page');
}

function UserProfile(props: { id?: string }) {
  return createElement('div', { id: 'user' }, `User: ${props.id}`);
}

describe('Router + Route', () => {
  it('renders the matching route', () => {
    window.location.hash = '#/';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(Route, { path: '/', component: Home, exact: true }),
        createElement(Route, { path: '/about', component: About }),
      ),
    );
    expect(container.querySelector('#home')).toBeTruthy();
    expect(container.querySelector('#about')).toBeNull();
    root.unmount();
  });

  it('renders about route when hash matches', () => {
    window.location.hash = '#/about';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(Route, { path: '/', component: Home, exact: true }),
        createElement(Route, { path: '/about', component: About }),
      ),
    );
    expect(container.querySelector('#about')).toBeTruthy();
    root.unmount();
  });

  it('passes route params to component', () => {
    window.location.hash = '#/users/42';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(Route, { path: '/users/:id', component: UserProfile }),
      ),
    );
    expect(container.textContent).toContain('User: 42');
    root.unmount();
  });

  it('renders nothing for non-matching route', () => {
    window.location.hash = '#/contact';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(Route, { path: '/about', component: About, exact: true }),
      ),
    );
    expect(container.querySelector('#about')).toBeNull();
    root.unmount();
  });

  it('renders children instead of component when provided', () => {
    window.location.hash = '#/info';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(
          Route,
          { path: '/info' },
          createElement('span', { id: 'info' }, 'Info content'),
        ),
      ),
    );
    expect(container.querySelector('#info')).toBeTruthy();
    root.unmount();
  });
});

describe('Link', () => {
  it('renders an anchor with hash href', () => {
    window.location.hash = '#/';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(Router, null, createElement(Link, { to: '/about', id: 'link' }, 'Go to About')),
    );
    const anchor = container.querySelector('#link') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor.tagName).toBe('A');
    expect(anchor.getAttribute('href')).toBe('#/about');
    expect(anchor.textContent).toBe('Go to About');
    root.unmount();
  });

  it('applies activeClassName when path matches', () => {
    window.location.hash = '#/about';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(
          Link,
          {
            to: '/about',
            className: 'nav-link',
            activeClassName: 'active',
            id: 'link',
          },
          'About',
        ),
      ),
    );
    const anchor = container.querySelector('#link')!;
    expect(anchor.className).toContain('active');
    expect(anchor.className).toContain('nav-link');
    root.unmount();
  });

  it('does not apply activeClassName when path does not match', () => {
    window.location.hash = '#/';
    __resetSnapshot();
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(
          Link,
          {
            to: '/about',
            className: 'nav-link',
            activeClassName: 'active',
            id: 'link',
          },
          'About',
        ),
      ),
    );
    const anchor = container.querySelector('#link')!;
    expect(anchor.className).not.toContain('active');
    root.unmount();
  });
});

describe('useRouter', () => {
  it('returns router context with pathname', () => {
    window.location.hash = '#/test';
    __resetSnapshot();
    let captured: any = null;
    function Inspector() {
      captured = useRouter();
      return createElement('div', null, 'inspector');
    }
    const root = createRoot(container);
    root.render(createElement(Router, null, createElement(Inspector, null)));
    expect(captured.pathname).toBe('/test');
    expect(typeof captured.navigate).toBe('function');
    root.unmount();
  });
});

describe('useParams', () => {
  it('returns matched params inside a Route', () => {
    window.location.hash = '#/items/abc';
    __resetSnapshot();
    let captured: any = null;
    function ParamReader() {
      captured = useParams();
      return createElement('div', null, 'params');
    }
    const root = createRoot(container);
    root.render(
      createElement(
        Router,
        null,
        createElement(Route, { path: '/items/:itemId', component: ParamReader }),
      ),
    );
    expect(captured).toEqual({ itemId: 'abc' });
    root.unmount();
  });
});

describe('useNavigate', () => {
  it('returns a navigate function', () => {
    window.location.hash = '#/';
    __resetSnapshot();
    let navFn: any = null;
    function NavGetter() {
      navFn = useNavigate();
      return createElement('div', null, 'nav');
    }
    const root = createRoot(container);
    root.render(createElement(Router, null, createElement(NavGetter, null)));
    expect(typeof navFn).toBe('function');
    root.unmount();
  });
});
