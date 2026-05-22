import { describe, it, expect } from 'vitest';
import { matchPath } from '../../../src/router/match-path';

describe('matchPath', () => {
  describe('literal segments', () => {
    it('matches exact path', () => {
      const result = matchPath('/about', '/about');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
      expect(result!.url).toBe('/about');
      expect(result!.params).toEqual({});
    });

    it('matches multi-segment path', () => {
      const result = matchPath('/users/list', '/users/list');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
    });

    it('returns null for non-matching path', () => {
      expect(matchPath('/about', '/contact')).toBeNull();
    });

    it('is case-insensitive', () => {
      const result = matchPath('/About', '/about');
      expect(result).not.toBeNull();
    });

    it('matches root path', () => {
      const result = matchPath('/', '/');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
      expect(result!.url).toBe('/');
    });

    it('root pattern partial-matches any path', () => {
      const result = matchPath('/', '/users/123');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(false);
    });

    it('root pattern with exact rejects non-root paths', () => {
      expect(matchPath('/', '/users/123', { exact: true })).toBeNull();
      expect(matchPath('/', '/about', { exact: true })).toBeNull();
    });

    it('root pattern with exact matches root', () => {
      const result = matchPath('/', '/', { exact: true });
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
    });

    it('strips trailing slashes', () => {
      const result = matchPath('/about/', '/about');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
    });
  });

  describe('named parameters', () => {
    it('extracts a single parameter', () => {
      const result = matchPath('/users/:id', '/users/123');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ id: '123' });
      expect(result!.isExact).toBe(true);
    });

    it('extracts multiple parameters', () => {
      const result = matchPath('/users/:userId/posts/:postId', '/users/42/posts/99');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ userId: '42', postId: '99' });
    });

    it('decodes URI components', () => {
      const result = matchPath('/search/:query', '/search/hello%20world');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ query: 'hello world' });
    });

    it('returns null when path is too short', () => {
      expect(matchPath('/users/:id', '/users')).toBeNull();
    });

    it('partial-matches by default (non-exact)', () => {
      const result = matchPath('/users/:id', '/users/123/posts');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(false);
      expect(result!.params).toEqual({ id: '123' });
      expect(result!.url).toBe('/users/123');
    });
  });

  describe('wildcard', () => {
    it('matches all remaining segments', () => {
      const result = matchPath('/files/*', '/files/a/b/c');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ '*': 'a/b/c' });
      expect(result!.isExact).toBe(true);
    });

    it('matches empty remaining path', () => {
      const result = matchPath('/files/*', '/files');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ '*': '' });
    });

    it('wildcard with prefix segments', () => {
      const result = matchPath('/api/:version/*', '/api/v2/users/list');
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ version: 'v2', '*': 'users/list' });
    });
  });

  describe('exact option', () => {
    it('rejects partial match when exact=true', () => {
      expect(matchPath('/users', '/users/123', { exact: true })).toBeNull();
    });

    it('accepts full match when exact=true', () => {
      const result = matchPath('/users/123', '/users/123', { exact: true });
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(true);
    });

    it('defaults to exact=false (allows partial)', () => {
      const result = matchPath('/users', '/users/123');
      expect(result).not.toBeNull();
      expect(result!.isExact).toBe(false);
    });

    it('exact with params rejects extra segments', () => {
      expect(matchPath('/users/:id', '/users/123/edit', { exact: true })).toBeNull();
    });

    it('exact with params accepts exact segment count', () => {
      const result = matchPath('/users/:id', '/users/123', { exact: true });
      expect(result).not.toBeNull();
      expect(result!.params).toEqual({ id: '123' });
    });
  });

  describe('edge cases', () => {
    it('empty pathname matches root', () => {
      const result = matchPath('/', '');
      expect(result).not.toBeNull();
    });

    it('pattern longer than path returns null', () => {
      expect(matchPath('/a/b/c', '/a/b')).toBeNull();
    });

    it('both root returns exact match', () => {
      const result = matchPath('/', '/');
      expect(result!.isExact).toBe(true);
    });

    it('result includes original pattern as path', () => {
      const result = matchPath('/users/:id', '/users/42');
      expect(result!.path).toBe('/users/:id');
    });
  });
});
