import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservaFormModal } from '../ReservaFormModal';

const baseForm = {
  nomeHospede: '', email: '', telefone: '', cpf: '',
  quartoId: '', numeroQuarto: '', dataCheckIn: '', dataCheckOut: '',
  adultos: 1, criancas: 0, valorTotal: '', formaPagamento: 'a_definir',
  observacoes: '', status: 'confirmada',
  faturadoCnpj: '', faturadoEmpresa: '', faturadoContato: '', faturadoEndereco: '',
};

const baseProps = () => ({
  open: true,
  onClose: vi.fn(),
  form: { ...baseForm },
  editId: null,
  set: (f) => vi.fn(),
  setUpper: (f) => vi.fn(),
  setMasked: (f, fn) => vi.fn(),
  setForm: vi.fn(),
  useCnpj: false,
  setUseCnpj: vi.fn(),
  quartos: [
    { id: 'q1', numero: 101, tipo: 'Standard', precoDiaria: 200, status: 'disponivel' },
    { id: 'q2', numero: 202, tipo: 'Deluxe', precoDiaria: 400, status: 'disponivel' },
  ],
  editReserva: null,
  calcularValor: vi.fn(),
  salvar: vi.fn(),
  saving: false,
  setModal: vi.fn(),
});

describe('ReservaFormModal', () => {
  it('renders Nova Reserva title', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText('Nova Reserva')).toBeDefined();
  });

  it('renders Editar Reserva title when editId set', () => {
    render(<ReservaFormModal {...baseProps()} editId="r1" />);
    expect(screen.getByText('Editar Reserva')).toBeDefined();
  });

  it('renders all sections', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText(/Dados do Hospede/i)).toBeDefined();
    expect(screen.getByText(/Quarto e Per/i)).toBeDefined();
    // Pagamento section title
    expect(document.body.textContent).toMatch(/Pagamento/);
  });

  it('renders quarto options', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText(/Quarto 101/)).toBeDefined();
    expect(screen.getByText(/Quarto 202/)).toBeDefined();
  });

  it('renders CPF label by default', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText('CPF')).toBeDefined();
  });

  it('renders CNPJ label when useCnpj is true', () => {
    render(<ReservaFormModal {...baseProps()} useCnpj={true} />);
    expect(screen.getByText('CNPJ')).toBeDefined();
  });

  it('renders Confirmar Reserva button for new', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText('Confirmar Reserva')).toBeDefined();
  });

  it('renders Salvar Alteracoes button for edit', () => {
    render(<ReservaFormModal {...baseProps()} editId="r1" />);
    expect(screen.getByText('Salvar Alteracoes')).toBeDefined();
  });

  it('calls onClose on Cancelar', () => {
    const props = baseProps();
    render(<ReservaFormModal {...props} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls salvar on confirm click', () => {
    const props = baseProps();
    render(<ReservaFormModal {...props} />);
    fireEvent.click(screen.getByText('Confirmar Reserva'));
    expect(props.salvar).toHaveBeenCalledWith(props.setModal);
  });

  it('shows faturado fields when faturado selected', () => {
    const props = baseProps();
    props.form = { ...baseForm, formaPagamento: 'faturado' };
    render(<ReservaFormModal {...props} />);
    expect(screen.getByText(/Dados da Empresa Faturada/i)).toBeDefined();
    expect(screen.getByPlaceholderText('Razao Social')).toBeDefined();
  });

  it('hides faturado fields for other payment methods', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.queryByText(/Dados da Empresa Faturada/)).toBeNull();
  });

  it('does not render when closed', () => {
    const { container } = render(<ReservaFormModal {...baseProps()} open={false} />);
    expect(container.textContent).toBe('');
  });

  it('renders form fields', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByPlaceholderText('NOME DO HOSPEDE')).toBeDefined();
    expect(screen.getByPlaceholderText('email@exemplo.com')).toBeDefined();
    expect(screen.getByPlaceholderText(/00000-0000/)).toBeDefined();
  });

  it('renders status select options', () => {
    render(<ReservaFormModal {...baseProps()} />);
    // Status options exist in the select
    const selects = document.querySelectorAll('select');
    const statusSelect = Array.from(selects).find(s => {
      const opts = Array.from(s.options).map(o => o.textContent);
      return opts.some(o => o.includes('Confirmada'));
    });
    expect(statusSelect).not.toBeNull();
  });

  it('renders Usar CNPJ checkbox', () => {
    render(<ReservaFormModal {...baseProps()} />);
    expect(screen.getByText('Usar CNPJ')).toBeDefined();
  });

  it('includes edit quarto in options when editing', () => {
    const props = baseProps();
    props.editId = 'r1';
    props.editReserva = { quartoId: 'q3' };
    props.quartos = [
      { id: 'q1', numero: 101, tipo: 'Standard', precoDiaria: 200, status: 'disponivel' },
      { id: 'q3', numero: 303, tipo: 'Suite', precoDiaria: 600, status: 'ocupado' },
    ];
    render(<ReservaFormModal {...props} />);
    // q3 should be available even though ocupado since it's the current reservation's room
    expect(screen.getByText(/Quarto 303/)).toBeDefined();
  });
});
