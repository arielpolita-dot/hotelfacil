import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should not render when open is false', () => {
    render(<Modal open={false} onClose={() => {}} title="Test">Content</Modal>);
    expect(screen.queryByText('Test')).toBeNull();
  });

  it('should render title and children when open', () => {
    render(<Modal open={true} onClose={() => {}} title="Test Title">Hello</Modal>);
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('should call onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should apply maxWidth class', () => {
    render(<Modal open={true} onClose={() => {}} title="Test" maxWidth="2xl">Content</Modal>);
    const panel = screen.getByRole('dialog');
    expect(panel.className).toContain('max-w-2xl');
  });
});
