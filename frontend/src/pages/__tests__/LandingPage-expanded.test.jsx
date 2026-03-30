import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderPage() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>);
}

describe('LandingPage (expanded)', () => {
  it('renders header with Acessar Sistema button', () => {
    renderPage();
    expect(screen.getByText('Acessar Sistema')).toBeDefined();
  });

  it('navigates to /app when Acessar Sistema clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('Acessar Sistema'));
    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  it('navigates to /app when Comece Agora clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Comece Agora/));
    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  it('navigates to /app when Comecar Teste Gratis clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Comecar Teste Gratis/));
    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  it('renders Saiba Mais link with #features href', () => {
    renderPage();
    const link = screen.getByText('Saiba Mais');
    expect(link.getAttribute('href')).toBe('#features');
  });

  it('renders all 3 feature cards', () => {
    renderPage();
    expect(screen.getByText('Dashboard em Tempo Real')).toBeDefined();
    expect(screen.getByText('Gestao de Quartos')).toBeDefined();
    expect(screen.getByText('Controle Financeiro')).toBeDefined();
  });

  it('renders all pricing list items', () => {
    renderPage();
    expect(screen.getByText('Quartos ilimitados')).toBeDefined();
    expect(screen.getByText('Reservas ilimitadas')).toBeDefined();
    expect(screen.getByText('Dashboard em tempo real')).toBeDefined();
    expect(screen.getByText('Controle financeiro completo')).toBeDefined();
    expect(screen.getByText('Multiplos usuarios')).toBeDefined();
    expect(screen.getByText('Suporte por email')).toBeDefined();
  });

  it('renders pricing amount', () => {
    renderPage();
    expect(screen.getByText(/99/)).toBeDefined();
    expect(screen.getByText(/\/mes/)).toBeDefined();
  });

  it('renders footer', () => {
    renderPage();
    expect(screen.getByText(/2026 OHospedeiro/)).toBeDefined();
  });

  it('renders hero subtitle text', () => {
    renderPage();
    expect(screen.getByText(/Controle reservas, quartos/i)).toBeDefined();
  });

  it('renders hero section with blue highlight', () => {
    renderPage();
    expect(screen.getByText('com simplicidade')).toBeDefined();
  });
});
