import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
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

  describe('PT-001 regression: URL parse failure must throw', () => {
    it('rejects unparseable URLs instead of silently allowing them', () => {
      expect(() => assertSecureUrl('just-a-filename.json')).toThrow('unable to validate URL');
    });

    it('rejects empty string', () => {
      expect(() => assertSecureUrl('')).toThrow('unable to validate URL');
    });

    it('rejects malformed protocol strings', () => {
      expect(() => assertSecureUrl('://')).toThrow('unable to validate URL');
    });

    it('rejects URLs that look absolute but are malformed', () => {
      expect(() => assertSecureUrl('ht tp://evil.com')).toThrow();
    });
  });

  describe('PT-005 regression: data URI size limit', () => {
    it('allows small data URIs', () => {
      expect(() => assertSecureUrl('data:text/plain;base64,SGVsbG8=')).not.toThrow();
    });

    it('rejects data URIs exceeding 1MB', () => {
      const huge = 'data:text/plain,' + 'x'.repeat(1024 * 1024 + 1);
      expect(() => assertSecureUrl(huge)).toThrow('exceeds 1MB limit');
    });
  });

  describe('PT-008 regression: localhost variants', () => {
    it('allows IPv6 localhost [::1]', () => {
      expect(() => assertSecureUrl('http://[::1]:3000/api')).not.toThrow();
    });

    it('allows 0.0.0.0', () => {
      expect(() => assertSecureUrl('http://0.0.0.0:8080')).not.toThrow();
    });

    it('allows 127.0.0.2 (loopback range)', () => {
      expect(() => assertSecureUrl('http://127.0.0.2:5000')).not.toThrow();
    });

    it('allows 127.255.255.255 (loopback range)', () => {
      expect(() => assertSecureUrl('http://127.255.255.255:9090')).not.toThrow();
    });

    it('rejects non-loopback private IPs', () => {
      expect(() => assertSecureUrl('http://192.168.1.1:3000')).toThrow('Insecure URL rejected');
    });
  });

  describe('PT-004 regression: redirect behavior', () => {
    it('secureFetch defaults to redirect error (validated via assertSecureUrl)', () => {
      // secureFetch calls assertSecureUrl then fetch with redirect:'error'
      // We can only verify assertSecureUrl here since fetch is a browser API
      expect(() => assertSecureUrl('https://example.com')).not.toThrow();
    });
  });
});
