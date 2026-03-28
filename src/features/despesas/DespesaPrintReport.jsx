import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { escapeHtml } from '../../utils/sanitize';
import { toDate } from '../../utils/dateUtils';

const STATUS_CFG = {
  pendente:  { label: 'Pendente' },
  pago:      { label: 'Pago' },
  cancelado: { label: 'Cancelado' },
};

export function printDespesasReport(despesasFiltradas, { filtroRapido, dataInicio, dataFim, totalFiltrado }) {
  const linhas = despesasFiltradas.map(d => {
    const dt = toDate(d.data);
    const dtStr = dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—';
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.pendente;
    const desc = escapeHtml(d.descricao);
    const forn = d.fornecedor ? `<br><small style="color:#94a3b8">${escapeHtml(d.fornecedor)}</small>` : '';
    const cat = escapeHtml(d.categoria);
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${desc}${forn}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${cat}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${dtStr}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${escapeHtml(cfg.label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:bold;">${formatCurrency(d.valor)}</td>
    </tr>`;
  }).join('');

  const periodoLabel = filtroRapido === 'hoje' ? 'Hoje' :
    filtroRapido === 'ontem' ? 'Ontem' :
    filtroRapido === 'periodo' && (dataInicio || dataFim)
      ? `${dataInicio ? format(new Date(dataInicio + 'T12:00:00'), 'dd/MM/yyyy') : '—'} a ${dataFim ? format(new Date(dataFim + 'T12:00:00'), 'dd/MM/yyyy') : '—'}`
      : 'Todos os periodos';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Despesas — Hotel Facil</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; margin: 0; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    tfoot td { padding: 10px 12px; font-weight: bold; border-top: 2px solid #e2e8f0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Relatorio de Despesas</h1>
  <p class="sub">Periodo: ${escapeHtml(periodoLabel)} &nbsp;|&nbsp; Gerado em: ${format(new Date(), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })} &nbsp;|&nbsp; ${despesasFiltradas.length} registros</p>
  <table>
    <thead>
      <tr>
        <th>Descricao</th>
        <th>Categoria</th>
        <th>Data</th>
        <th>Status</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td colspan="4">Total</td>
        <td style="text-align:right">${formatCurrency(totalFiltrado)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
