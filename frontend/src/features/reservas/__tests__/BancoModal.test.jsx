import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BancoModal } from '../BancoModal';

const defaultProps = () => ({
  open: true,
  onClose: vi.fn(),
  editBancoId: null,
  bancoForm: { nome: '', agencia: '', conta: '' },
  setBancoForm: vi.fn(),
  adicionarBanco: vi.fn().mockResolvedValue({ id: 'b-new' }),
  atualizarBanco: vi.fn().mockResolvedValue(),
  setForm: vi.fn(),
});

describe('BancoModal', () => {
  it('renders Cadastrar Banco title when not editing', () => {
    render(<BancoModal {...defaultProps()} />);
    expect(screen.getByText('Cadastrar Banco')).toBeDefined();
  });

  it('renders Editar Banco title when editing', () => {
    render(<BancoModal {...defaultProps()} editBancoId="b1" />);
    expect(screen.getByText('Editar Banco')).toBeDefined();
  });

  it('calls adicionarBanco when saving new banco', async () => {
    const props = defaultProps();
    props.bancoForm = { nome: 'ITAU', agencia: '1234', conta: '5678' };
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Salvar Banco'));
    await waitFor(() => {
      expect(props.adicionarBanco).toHaveBeenCalledWith({ nome: 'ITAU', agencia: '1234', conta: '5678' });
    });
  });

  it('sets bancoId in form after creating', async () => {
    const props = defaultProps();
    props.bancoForm = { nome: 'ITAU', agencia: '', conta: '' };
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Salvar Banco'));
    await waitFor(() => {
      expect(props.setForm).toHaveBeenCalled();
    });
  });

  it('calls atualizarBanco when editing', async () => {
    const props = defaultProps();
    props.editBancoId = 'b1';
    props.bancoForm = { nome: 'BRADESCO', agencia: '0001', conta: '1234' };
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Salvar Banco'));
    await waitFor(() => {
      expect(props.atualizarBanco).toHaveBeenCalledWith('b1', props.bancoForm);
    });
  });

  it('disables save button when nome is empty', () => {
    const props = defaultProps();
    props.bancoForm = { nome: '  ', agencia: '', conta: '' };
    render(<BancoModal {...props} />);
    const btn = screen.getByText('Salvar Banco');
    expect(btn.disabled).toBe(true);
  });

  it('calls onClose on Cancelar click', () => {
    const props = defaultProps();
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onClose after successful save', async () => {
    const props = defaultProps();
    props.bancoForm = { nome: 'NUBANK', agencia: '', conta: '' };
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Salvar Banco'));
    await waitFor(() => {
      expect(props.onClose).toHaveBeenCalled();
    });
  });

  it('renders form fields', () => {
    render(<BancoModal {...defaultProps()} />);
    expect(screen.getByPlaceholderText(/BRADESCO/i)).toBeDefined();
    expect(screen.getByPlaceholderText('0000-0')).toBeDefined();
    expect(screen.getByPlaceholderText('00000-0')).toBeDefined();
  });

  it('does not render when closed', () => {
    const { container } = render(<BancoModal {...defaultProps()} open={false} />);
    expect(container.textContent).toBe('');
  });

  it('shows alert on save error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const props = defaultProps();
    props.bancoForm = { nome: 'TEST', agencia: '', conta: '' };
    props.adicionarBanco.mockRejectedValue(new Error('fail'));
    render(<BancoModal {...props} />);
    fireEvent.click(screen.getByText('Salvar Banco'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('fail'));
    });
    alertSpy.mockRestore();
  });
});
