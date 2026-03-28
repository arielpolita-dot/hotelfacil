import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  it('should render with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Buscar quartos..." />);
    expect(screen.getByPlaceholderText('Buscar quartos...')).toBeDefined();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should use default placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeDefined();
  });
});
