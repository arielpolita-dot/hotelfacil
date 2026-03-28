import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPills } from '../FilterPills';

const OPTIONS = [
  { key: 'todos', label: 'Todos', count: 10 },
  { key: 'ativo', label: 'Ativos', count: 7 },
  { key: 'inativo', label: 'Inativos', count: 3 },
];

describe('FilterPills', () => {
  it('should render all options with counts', () => {
    render(<FilterPills options={OPTIONS} value="todos" onChange={() => {}} />);
    expect(screen.getByText('Todos (10)')).toBeDefined();
    expect(screen.getByText('Ativos (7)')).toBeDefined();
  });

  it('should call onChange with key when clicked', () => {
    const onChange = vi.fn();
    render(<FilterPills options={OPTIONS} value="todos" onChange={onChange} />);
    fireEvent.click(screen.getByText('Ativos (7)'));
    expect(onChange).toHaveBeenCalledWith('ativo');
  });

  it('should highlight active pill', () => {
    render(<FilterPills options={OPTIONS} value="ativo" onChange={() => {}} />);
    const activeBtn = screen.getByText('Ativos (7)').closest('button');
    expect(activeBtn.className).toContain('bg-blue-600');
  });
});
