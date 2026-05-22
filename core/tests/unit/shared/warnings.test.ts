import {
  describe,
  it,
  expect,
  fn,
  spyOn,
  mock,
  beforeEach,
} from '@asymmetric-effort/nogginlessdom';
import { warn, error, resetWarnings } from '../../../src/shared/warnings';

describe('warnings', () => {
  beforeEach(() => {
    resetWarnings();
  });

  describe('warn', () => {
    it('logs a warning', () => {
      const spy = spyOn(console, 'warn').mockImplementation(() => {});
      warn('test warning');
      expect(spy).toHaveBeenCalledWith('[SpecifyJS] test warning');
      spy.mockRestore();
    });

    it('deduplicates identical warnings', () => {
      const spy = spyOn(console, 'warn').mockImplementation(() => {});
      warn('duplicate');
      warn('duplicate');
      warn('duplicate');
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('logs different warnings separately', () => {
      const spy = spyOn(console, 'warn').mockImplementation(() => {});
      warn('first');
      warn('second');
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe('error', () => {
    it('logs an error', () => {
      const spy = spyOn(console, 'error').mockImplementation(() => {});
      error('test error');
      expect(spy).toHaveBeenCalledWith('[SpecifyJS] test error');
      spy.mockRestore();
    });

    it('does not deduplicate errors', () => {
      const spy = spyOn(console, 'error').mockImplementation(() => {});
      error('same');
      error('same');
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe('resetWarnings', () => {
    it('allows previously-warned messages to warn again', () => {
      const spy = spyOn(console, 'warn').mockImplementation(() => {});
      warn('reset-test');
      expect(spy).toHaveBeenCalledTimes(1);

      resetWarnings();
      warn('reset-test');
      expect(spy).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });
});
