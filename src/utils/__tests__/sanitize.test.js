import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../sanitize';

describe('escapeHtml', () => {
  it('should escape < and >', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
  it('should escape &', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
  it('should escape quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });
  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
  it('should handle null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
