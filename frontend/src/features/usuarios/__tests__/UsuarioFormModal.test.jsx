import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsuarioFormModal } from '../UsuarioFormModal';
import { getPermissoesPorRole } from '../permissions';

const baseFormData = {
  nome: '', email: '', telefone: '', senha: '', confirmarSenha: '',
  role: 'Recepcionista', status: 'Ativo',
  permissoes: getPermissoesPorRole('Recepcionista'), observacoes: '',
};

const renderModal = (overrides = {}) => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    editingUsuario: null,
    formData: { ...baseFormData },
    handleInputChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<UsuarioFormModal {...props} />), props };
};

describe('UsuarioFormModal', () => {
  it('renders Novo Usuario title when not editing', () => {
    renderModal();
    expect(screen.getByText('Novo Usuario')).toBeDefined();
  });

  it('renders Editar Usuario title when editing', () => {
    renderModal({ editingUsuario: { id: 'u1' } });
    expect(screen.getByText('Editar Usuario')).toBeDefined();
  });

  it('renders all form sections', () => {
    renderModal();
    expect(screen.getByText('Dados Pessoais')).toBeDefined();
    expect(screen.getByText('Dados de Acesso')).toBeDefined();
    expect(screen.getByText(/Funcao e Permissoes/i)).toBeDefined();
  });

  it('renders submit button text for new user', () => {
    renderModal();
    expect(screen.getByText(/Cadastrar Usuario/i)).toBeDefined();
  });

  it('renders submit button text for edit', () => {
    renderModal({ editingUsuario: { id: 'u1' } });
    expect(screen.getByText(/Atualizar Usuario/i)).toBeDefined();
  });

  it('calls onSave on form submit', () => {
    const { props } = renderModal();
    const form = document.querySelector('form');
    fireEvent.submit(form);
    expect(props.onSave).toHaveBeenCalled();
  });

  it('calls onClose on Cancelar', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    renderModal();
    const passwordInput = document.querySelector('input[name="senha"]');
    expect(passwordInput.type).toBe('password');
    // Click the eye button
    const toggleBtn = passwordInput.parentElement.querySelector('button');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('shows password hint when editing', () => {
    renderModal({ editingUsuario: { id: 'u1' } });
    expect(screen.getByText(/deixe em branco/i)).toBeDefined();
  });

  it('renders permissoes checkboxes', () => {
    renderModal();
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('does not render when closed', () => {
    const { container } = render(
      <UsuarioFormModal open={false} onClose={vi.fn()} onSave={vi.fn()}
        editingUsuario={null} formData={baseFormData} handleInputChange={vi.fn()} />
    );
    expect(container.textContent).toBe('');
  });
});
