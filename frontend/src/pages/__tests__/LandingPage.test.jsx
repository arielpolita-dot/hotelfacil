import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';

function renderPage() {
  return render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
}

describe('LandingPage', () => {
  it('renders the brand name', () => {
    renderPage();
    expect(screen.getByText('OHospedeiro')).toBeDefined();
  });

  it('renders hero title', () => {
    renderPage();
    expect(screen.getByText(/Gerencie seu hotel/i)).toBeDefined();
  });

  it('renders CTA button', () => {
    renderPage();
    expect(screen.getByText(/Comece Agora/i)).toBeDefined();
  });

  it('renders pricing section with price', () => {
    renderPage();
    expect(screen.getByText(/99/)).toBeDefined();
  });

  it('renders feature cards', () => {
    renderPage();
    expect(screen.getByText('Dashboard em Tempo Real')).toBeDefined();
    expect(screen.getByText('Gestao de Quartos')).toBeDefined();
    // "Controle Financeiro" appears in both features and pricing list
    expect(screen.getAllByText(/Controle Financeiro/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Acessar Sistema button', () => {
    renderPage();
    expect(screen.getByText('Acessar Sistema')).toBeDefined();
  });
});
