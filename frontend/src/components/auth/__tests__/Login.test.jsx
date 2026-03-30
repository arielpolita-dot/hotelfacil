import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockLogin = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

import Login from '../Login';

describe('Login', () => {
  it('renders Bem-vindo title', () => {
    render(<Login />);
    expect(screen.getByText('Bem-vindo!')).toBeDefined();
  });

  it('renders Hotel Facil brand', () => {
    render(<Login />);
    expect(screen.getAllByText('Hotel Facil').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Entrar com Authify button', () => {
    render(<Login />);
    expect(screen.getByText('Entrar com Authify')).toBeDefined();
  });

  it('calls login on button click', () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Entrar com Authify'));
    expect(mockLogin).toHaveBeenCalled();
  });

  it('renders feature list', () => {
    render(<Login />);
    expect(screen.getByText('Dashboard em tempo real')).toBeDefined();
    expect(screen.getByText('Gestao de quartos')).toBeDefined();
    expect(screen.getByText('Controle financeiro')).toBeDefined();
  });

  it('renders copyright', () => {
    render(<Login />);
    expect(screen.getByText(/Hotel Facil - Todos os direitos/)).toBeDefined();
  });

  it('renders description text', () => {
    render(<Login />);
    expect(screen.getByText(/Entre com sua conta/)).toBeDefined();
  });
});
