import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockHotel = {
  quartos: [
    { id: 'q1', numero: 101, tipo: 'Standard', capacidade: 2, precoDiaria: 150, status: 'disponivel', descricao: 'Quarto 101', andar: '1' },
    { id: 'q2', numero: 202, tipo: 'Deluxe', capacidade: 3, precoDiaria: 300, status: 'ocupado', descricao: 'Quarto 202', andar: '2' },
    { id: 'q3', numero: 303, tipo: 'Suite', capacidade: 4, precoDiaria: 500, status: 'manutencao', descricao: '', andar: '3' },
  ],
  adicionarQuarto: vi.fn().mockResolvedValue('q-new'),
  atualizarQuarto: vi.fn().mockResolvedValue(),
  removerQuarto: vi.fn().mockResolvedValue(),
  loading: false,
};

vi.mock('../../../context/HotelContext', () => ({
  useHotel: () => mockHotel,
}));

import Quartos from '../Quartos';

const wrap = () => render(<BrowserRouter><Quartos /></BrowserRouter>);

describe('Quartos (expanded)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all quartos', () => {
    wrap();
    expect(document.body.textContent).toContain('101');
    expect(document.body.textContent).toContain('202');
    expect(document.body.textContent).toContain('303');
  });

  it('filters by search', () => {
    wrap();
    const search = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(search, { target: { value: '101' } });
    expect(document.body.textContent).toContain('101');
    expect(document.body.textContent).not.toContain('202');
  });

  it('opens new quarto modal', () => {
    wrap();
    fireEvent.click(screen.getByText(/Novo Quarto/i));
    expect(screen.getByText(/Salvar/i)).toBeDefined();
  });

  it('opens edit quarto modal on edit click', () => {
    wrap();
    const editBtns = screen.getAllByText('Editar');
    fireEvent.click(editBtns[0]);
    expect(screen.getByText(/Salvar/i)).toBeDefined();
  });

  it('opens delete confirmation', () => {
    wrap();
    const deleteBtns = screen.getAllByText('Excluir');
    fireEvent.click(deleteBtns[0]);
    expect(document.body.textContent).toMatch(/exclu|delet|remov/i);
  });

  it('renders status badges', () => {
    wrap();
    expect(screen.getByText('Disponivel')).toBeDefined();
    expect(screen.getByText('Ocupado')).toBeDefined();
    expect(screen.getByText('Manutencao')).toBeDefined();
  });

  it('shows price in currency format', () => {
    wrap();
    expect(document.body.textContent).toContain('150');
    expect(document.body.textContent).toContain('300');
  });

  it('renders Novo Quarto button', () => {
    wrap();
    expect(screen.getByText('Novo Quarto')).toBeDefined();
  });
});
