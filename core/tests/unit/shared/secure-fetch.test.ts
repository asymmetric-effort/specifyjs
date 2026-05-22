import { describe, it, expect } from 'vitest';
import { assertSecureUrl } from '../../../src/shared/secure-fetch';

describe('assertSecureUrl', () => {
  describe('allowed URLs', () => {
    it('allows https:// URLs', () => {
      expect(() => assertSecureUrl('https://api.example.com/data')).not.toThrow();
    });

    it('allows relative paths starting with /', () => {
      expect(() => assertSecureUrl('/data/file.json')).not.toThrow();
    });

    it('allows relative paths starting with ./', () => {
      expect(() => assertSecureUrl('./data/file.json')).not.toThrow();
    });

    it('allows relative paths starting with ../', () => {
      expect(() => assertSecureUrl('../data/file.json')).not.toThrow();
    });

    it('allows data: URLs', () => {
      expect(() => assertSecureUrl('data:text/plain;base64,SGVsbG8=')).not.toThrow();
    });

    it('allows localhost http (development)', () => {
      expect(() => assertSecureUrl('http://localhost:5173/api')).not.toThrow();
    });

    it('allows 127.0.0.1 http (development)', () => {
      expect(() => assertSecureUrl('http://127.0.0.1:3000/data')).not.toThrow();
    });

    it('allows localhost https', () => {
      expect(() => assertSecureUrl('https://localhost:5173/api')).not.toThrow();
    });
  });

  describe('rejected URLs', () => {
    it('rejects http:// URLs', () => {
      expect(() => assertSecureUrl('http://api.example.com/data')).toThrow('Insecure URL rejected');
    });

    it('rejects http:// with port', () => {
      expect(() => assertSecureUrl('http://api.example.com:8080/data')).toThrow('HTTPS-only');
    });

    it('error message includes the URL', () => {
      expect(() => assertSecureUrl('http://evil.com/steal')).toThrow('http://evil.com/steal');
    });

    it('error message suggests https://', () => {
      expect(() => assertSecureUrl('http://example.com')).toThrow('https://');
    });
  });

  describe('edge cases', () => {
    it('allows unparseable strings (treated as relative)', () => {
      expect(() => assertSecureUrl('just-a-filename.json')).not.toThrow();
    });

    it('allows empty string', () => {
      expect(() => assertSecureUrl('')).not.toThrow();
    });
  });
});
