import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to DOM APIs', () => {
    const div = document.createElement('div');
    div.textContent = 'HotelFacil';
    expect(div.textContent).toBe('HotelFacil');
  });
});
