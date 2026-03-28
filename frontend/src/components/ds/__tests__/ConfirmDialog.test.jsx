import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('should not render when open is false', () => {
    render(<ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="Delete?" message="Sure?" />);
    expect(screen.queryByText('Delete?')).toBeNull();
  });

  it('should render title and message when open', () => {
    render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="Excluir?" message="Tem certeza?" />);
    expect(screen.getByText('Excluir?')).toBeDefined();
    expect(screen.getByText('Tem certeza?')).toBeDefined();
  });

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={onConfirm} title="X" message="Y" />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open={true} onClose={onClose} onConfirm={() => {}} title="X" message="Y" />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should use custom confirm label', () => {
    render(<ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="X" message="Y" confirmLabel="Deletar" />);
    expect(screen.getByText('Deletar')).toBeDefined();
  });
});
