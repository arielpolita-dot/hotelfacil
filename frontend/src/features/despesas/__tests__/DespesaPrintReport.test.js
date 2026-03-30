import { describe, it, expect, vi, beforeEach } from 'vitest';
import { printDespesasReport } from '../DespesaPrintReport';

describe('printDespesasReport', () => {
  let mockWindow;

  beforeEach(() => {
    mockWindow = {
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWindow);
  });

  const baseDespesas = [
    { id: 'd1', descricao: 'Limpeza', categoria: 'Servicos', data: '2026-03-15T12:00:00', status: 'pendente', valor: 100, fornecedor: 'Forn A' },
    { id: 'd2', descricao: 'Material', categoria: 'Insumos', data: '2026-03-16T12:00:00', status: 'pago', valor: 200 },
  ];

  it('opens print window with HTML content', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    expect(window.open).toHaveBeenCalledWith('', '_blank');
    expect(mockWindow.document.write).toHaveBeenCalled();
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Relatorio de Despesas');
    expect(html).toContain('Limpeza');
    expect(html).toContain('Material');
  });

  it('includes fornecedor when present', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Forn A');
  });

  it('shows "Hoje" for filtroRapido hoje', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'hoje', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Hoje');
  });

  it('shows "Ontem" for filtroRapido ontem', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'ontem', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Ontem');
  });

  it('shows date range for filtroRapido periodo', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'periodo', dataInicio: '2026-03-01', dataFim: '2026-03-31', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('01/03/2026');
    expect(html).toContain('31/03/2026');
  });

  it('shows dash when date range is partial', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'periodo', dataInicio: '', dataFim: '2026-03-31', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    // Has a dash for missing start date
    expect(html).toMatch(/—/);
  });

  it('shows "Todos os periodos" when filtroRapido is generic', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Todos os periodos');
  });

  it('handles unknown status gracefully', () => {
    const despesas = [{ id: 'd3', descricao: 'X', categoria: 'Y', data: '2026-03-15', status: 'desconhecido', valor: 50 }];
    printDespesasReport(despesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 50 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Pendente'); // falls back to pendente
  });

  it('handles invalid date gracefully', () => {
    const despesas = [{ id: 'd4', descricao: 'Z', categoria: 'Y', data: null, status: 'pago', valor: 10 }];
    printDespesasReport(despesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 10 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('—');
  });

  it('shows total in footer', () => {
    printDespesasReport(baseDespesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 300 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).toContain('Total');
  });

  it('escapes HTML in descriptions', () => {
    const despesas = [{ id: 'd5', descricao: '<script>alert(1)</script>', categoria: 'X', data: '2026-03-15', status: 'pago', valor: 10 }];
    printDespesasReport(despesas, { filtroRapido: 'todos', dataInicio: '', dataFim: '', totalFiltrado: 10 });
    const html = mockWindow.document.write.mock.calls[0][0];
    expect(html).not.toContain('<script>');
  });
});
