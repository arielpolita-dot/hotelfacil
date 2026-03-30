import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoUploader } from '../LogoUploader';

describe('LogoUploader', () => {
  it('renders logotipo heading', () => {
    render(<LogoUploader onFileSelected={vi.fn()} />);
    expect(screen.getByText('Logotipo')).toBeDefined();
  });

  it('renders Enviar logotipo when no preview', () => {
    render(<LogoUploader onFileSelected={vi.fn()} />);
    expect(screen.getByText('Enviar logotipo')).toBeDefined();
  });

  it('renders Alterar logotipo when preview exists', () => {
    render(<LogoUploader logoPreview="http://test.com/logo.png" onFileSelected={vi.fn()} />);
    expect(screen.getByText('Alterar logotipo')).toBeDefined();
  });

  it('shows upload placeholder when no preview', () => {
    render(<LogoUploader onFileSelected={vi.fn()} />);
    expect(screen.getByText(/Clique para/)).toBeDefined();
  });

  it('shows image when preview exists', () => {
    render(<LogoUploader logoPreview="http://test.com/logo.png" onFileSelected={vi.fn()} />);
    const img = document.querySelector('img[alt="Logo"]');
    expect(img).not.toBeNull();
    expect(img.src).toBe('http://test.com/logo.png');
  });

  it('renders file format info', () => {
    render(<LogoUploader onFileSelected={vi.fn()} />);
    expect(screen.getByText(/PNG, JPG ou SVG/)).toBeDefined();
    expect(screen.getByText(/200x200px/)).toBeDefined();
  });
});
