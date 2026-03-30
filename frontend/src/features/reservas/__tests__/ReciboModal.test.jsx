import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReciboModal } from '../ReciboModal';

const baseReciboData = {
  reservaId: 'res-abc123def',
  nomeHospede: 'Joao Silva',
  cpf: '000.000.000-00',
  telefone: '(11) 99999-9999',
  email: 'joao@test.com',
  numeroQuarto: '101',
  dataCheckIn: '2026-03-01',
  dataCheckOut: '2026-03-05',
  adultos: 2,
  criancas: 1,
  valorBase: 600,
  valorExtra: 50,
  desconto: 30,
  valorFinal: 620,
  formaPagamento: 'pix',
  parcelas: 1,
  dataPagamento: '2026-03-05',
  observacoes: 'Sem obs',
};

const baseEmpresa = {
  nome: 'Hotel Teste',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua X, 123',
  cidade: 'Sao Paulo',
  estado: 'SP',
  telefone: '(11) 1111-1111',
  site: 'www.hotel.com',
};

describe('ReciboModal', () => {
  it('returns null when reciboData is null', () => {
    const { container } = render(
      <ReciboModal reciboData={null} empresaAtual={baseEmpresa} onClose={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders guest name and room number', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('Joao Silva')).toBeDefined();
    expect(screen.getByText('101')).toBeDefined();
  });

  it('renders empresa info', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('Hotel Teste')).toBeDefined();
    expect(screen.getByText(/CNPJ: 00\.000\.000\/0001-00/)).toBeDefined();
  });

  it('renders empresa address with cidade and estado', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText(/Rua X, 123, Sao Paulo - SP/)).toBeDefined();
  });

  it('renders hotel with no optional fields', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={{ nome: 'Test' }} onClose={vi.fn()} />);
    expect(screen.getByText('Test')).toBeDefined();
  });

  it('renders null empresa gracefully', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={null} onClose={vi.fn()} />);
    expect(screen.getByText('Hotel')).toBeDefined();
  });

  it('renders valor extra and desconto lines', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('Valor extra:')).toBeDefined();
    expect(screen.getByText('Desconto:')).toBeDefined();
  });

  it('hides valor extra when 0', () => {
    const data = { ...baseReciboData, valorExtra: 0 };
    render(<ReciboModal reciboData={data} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.queryByText('Valor extra:')).toBeNull();
  });

  it('hides desconto when 0', () => {
    const data = { ...baseReciboData, desconto: 0 };
    render(<ReciboModal reciboData={data} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.queryByText('Desconto:')).toBeNull();
  });

  it('shows parcelas info when parcelas > 1', () => {
    const data = { ...baseReciboData, parcelas: 3, formaPagamento: 'cartao_credito' };
    render(<ReciboModal reciboData={data} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText(/3x de/)).toBeDefined();
  });

  it('hides parcelas when parcelas is 1', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.queryByText(/1x de/)).toBeNull();
  });

  it('renders criancas count when > 0', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText(/2 adulto\(s\), 1 crianca\(s\)/)).toBeDefined();
  });

  it('hides criancas when 0', () => {
    const data = { ...baseReciboData, criancas: 0 };
    render(<ReciboModal reciboData={data} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText(/2 adulto\(s\)/)).toBeDefined();
    expect(screen.queryByText(/crianca/)).toBeNull();
  });

  it('renders observacoes when present', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('Sem obs')).toBeDefined();
  });

  it('renders site in footer when empresa has it', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('www.hotel.com')).toBeDefined();
  });

  it('renders logo when empresa has logoUrl', () => {
    const emp = { ...baseEmpresa, logoUrl: 'http://test.com/logo.png' };
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={emp} onClose={vi.fn()} />);
    const img = document.querySelector('img[alt="Logo"]');
    expect(img).not.toBeNull();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={onClose} />);
    fireEvent.click(screen.getByText('Fechar sem imprimir'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls print when Imprimir button clicked', () => {
    const mockWindow = { document: { write: vi.fn(), close: vi.fn() }, focus: vi.fn(), print: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(mockWindow);
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Imprimir Recibo'));
    expect(window.open).toHaveBeenCalledWith('', '_blank');
    expect(mockWindow.document.write).toHaveBeenCalled();
    window.open.mockRestore();
  });

  it('renders cpf and telefone and email when present', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText('000.000.000-00')).toBeDefined();
    expect(screen.getByText('(11) 99999-9999')).toBeDefined();
    expect(screen.getByText('joao@test.com')).toBeDefined();
  });

  it('falls back to today date when dataPagamento missing', () => {
    const data = { ...baseReciboData, dataPagamento: null };
    render(<ReciboModal reciboData={data} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    // Should render today's date
    const today = new Date().toLocaleDateString('pt-BR');
    expect(document.body.textContent).toContain(today);
  });

  it('renders reservaId suffix in uppercase', () => {
    render(<ReciboModal reciboData={baseReciboData} empresaAtual={baseEmpresa} onClose={vi.fn()} />);
    expect(screen.getByText(/23DEF/i)).toBeDefined();
  });
});
