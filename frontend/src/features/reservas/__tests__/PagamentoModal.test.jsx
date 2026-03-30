import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PagamentoModal } from '../PagamentoModal';

const baseForm = {
  dataPagamento: '2026-03-15',
  formaPagamento: 'pix',
  bancoId: '',
  valorTotal: '500',
  valorExtra: '0',
  desconto: '0',
  parcelas: '1',
  faturadoCnpj: '',
  faturadoEmpresa: '',
  faturadoContato: '',
  faturadoEndereco: '',
};

const baseProps = () => ({
  open: true,
  onClose: vi.fn(),
  form: { ...baseForm },
  set: (f) => vi.fn(),
  setForm: vi.fn(),
  editReserva: { nomeHospede: 'Maria', numeroQuarto: '101', dataCheckIn: '2026-03-10', dataCheckOut: '2026-03-15' },
  bancos: [{ id: 'b1', nome: 'Banco X', agencia: '1234', conta: '5678' }],
  isCartao: (fp) => fp === 'cartao_credito' || fp === 'cartao_debito',
  calcularValorFinal: () => 500,
  salvarPagamento: vi.fn(),
  saving: false,
  setModal: vi.fn(),
  setReciboData: vi.fn(),
  setEditBancoId: vi.fn(),
  setBancoForm: vi.fn(),
  setModalBanco: vi.fn(),
});

describe('PagamentoModal', () => {
  it('renders reserva summary', () => {
    render(<PagamentoModal {...baseProps()} />);
    expect(screen.getByText('Maria')).toBeDefined();
  });

  it('renders payment title', () => {
    render(<PagamentoModal {...baseProps()} />);
    expect(screen.getByText('Registrar Pagamento')).toBeDefined();
  });

  it('shows banco select for pix payment', () => {
    render(<PagamentoModal {...baseProps()} />);
    expect(screen.getByText('Banco')).toBeDefined();
    expect(screen.getByText('Banco X')).toBeDefined();
  });

  it('hides banco select for dinheiro payment', () => {
    const props = baseProps();
    props.form = { ...baseForm, formaPagamento: 'dinheiro' };
    render(<PagamentoModal {...props} />);
    expect(screen.queryByText('Banco')).toBeNull();
  });

  it('shows parcelamento for cartao_credito', () => {
    const props = baseProps();
    props.form = { ...baseForm, formaPagamento: 'cartao_credito' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText('Parcelamento')).toBeDefined();
  });

  it('hides parcelamento for pix', () => {
    render(<PagamentoModal {...baseProps()} />);
    expect(screen.queryByText('Parcelamento')).toBeNull();
  });

  it('shows faturado fields when formaPagamento is faturado', () => {
    const props = baseProps();
    props.form = { ...baseForm, formaPagamento: 'faturado' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText(/Dados da Empresa Faturada/i)).toBeDefined();
    expect(screen.getByPlaceholderText('Razao Social')).toBeDefined();
  });

  it('shows valor summary when valorExtra > 0', () => {
    const props = baseProps();
    props.form = { ...baseForm, valorExtra: '50' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText('+ Valor extra')).toBeDefined();
  });

  it('shows valor summary when desconto > 0', () => {
    const props = baseProps();
    props.form = { ...baseForm, desconto: '30' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText('- Desconto')).toBeDefined();
  });

  it('shows parcelamento summary without extra/desconto for cartao', () => {
    const props = baseProps();
    props.form = { ...baseForm, formaPagamento: 'cartao_credito', parcelas: '3' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText(/3x de/)).toBeDefined();
  });

  it('shows banco details when bancoId selected', () => {
    const props = baseProps();
    props.form = { ...baseForm, bancoId: 'b1' };
    render(<PagamentoModal {...props} />);
    expect(screen.getByText(/Agencia:/)).toBeDefined();
    expect(screen.getByText('1234')).toBeDefined();
  });

  it('calls salvarPagamento on confirm click', () => {
    const props = baseProps();
    render(<PagamentoModal {...props} />);
    fireEvent.click(screen.getByText('Confirmar Pagamento'));
    expect(props.salvarPagamento).toHaveBeenCalledWith(props.setModal, props.setReciboData);
  });

  it('calls onClose on Cancelar', () => {
    const props = baseProps();
    render(<PagamentoModal {...props} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(<PagamentoModal {...baseProps()} open={false} />);
    expect(container.textContent).toBe('');
  });

  it('renders Salvando... when saving', () => {
    render(<PagamentoModal {...baseProps()} saving={true} />);
    expect(screen.getByText('Salvando...')).toBeDefined();
  });

  it('shows Cadastrar banco link', () => {
    render(<PagamentoModal {...baseProps()} />);
    expect(screen.getByText(/Cadastrar banco/i)).toBeDefined();
  });
});
