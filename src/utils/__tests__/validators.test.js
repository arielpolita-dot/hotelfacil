import { describe, it, expect } from 'vitest';
import { validateId, validateRequired } from '../validators';

describe('validateId', () => {
  it('should throw for null', () => {
    expect(() => validateId(null, 'empresaId')).toThrow('empresaId is required');
  });
  it('should throw for empty string', () => {
    expect(() => validateId('', 'empresaId')).toThrow('empresaId is required');
  });
  it('should throw for string with path separator', () => {
    expect(() => validateId('a/b', 'empresaId')).toThrow('must not contain path separators');
  });
  it('should not throw for valid id', () => {
    expect(() => validateId('abc123', 'empresaId')).not.toThrow();
  });
});

describe('validateRequired', () => {
  it('should throw for null', () => {
    expect(() => validateRequired(null, 'nome')).toThrow('nome is required');
  });
  it('should throw for empty string', () => {
    expect(() => validateRequired('', 'nome')).toThrow('nome is required');
  });
  it('should not throw for valid value', () => {
    expect(() => validateRequired('John', 'nome')).not.toThrow();
  });
});
