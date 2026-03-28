import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('should render label and children', () => {
    render(<FormField label="Nome"><input data-testid="input" /></FormField>);
    expect(screen.getByText('Nome')).toBeDefined();
    expect(screen.getByTestId('input')).toBeDefined();
  });

  it('should show required indicator', () => {
    render(<FormField label="Email" required><input /></FormField>);
    expect(screen.getByText('*')).toBeDefined();
  });

  it('should associate label with htmlFor', () => {
    render(<FormField label="Nome" htmlFor="name-input"><input id="name-input" /></FormField>);
    const label = screen.getByText('Nome').closest('label');
    expect(label.getAttribute('for')).toBe('name-input');
  });
});
