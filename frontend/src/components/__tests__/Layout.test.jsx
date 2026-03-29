import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock all contexts
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'test@test.com', displayName: 'Test' },
    logout: vi.fn(),
  }),
}));

vi.mock('../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    empresaAtual: { id: 'e1', nome: 'Hotel Teste' },
    companies: [{ id: 'e1', nome: 'Hotel Teste' }],
    switchEmpresa: vi.fn(),
    createEmpresa: vi.fn(),
  }),
}));

vi.mock('../../context/HotelContext', () => ({
  useHotel: () => ({
    despesas: [],
  }),
}));

describe('Layout', () => {
  it('renders children content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('renders empresa name in header', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Hotel Teste')).toBeDefined();
  });
});
