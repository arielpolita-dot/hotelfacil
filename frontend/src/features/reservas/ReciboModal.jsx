import { toDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { X, CheckCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FORMAS_PAGAMENTO } from './constants';

export function ReciboModal({ reciboData, empresaAtual, onClose }) {
  if (!reciboData) return null;

  const imprimirRecibo = () => {
    const conteudo = document.getElementById('recibo-print').innerHTML;
    const janela = window.open('','_blank');
    janela.document.write(`<!DOCTYPE html><html><head><title>Recibo de Hospedagem</title><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:24px;max-width:600px;margin:0 auto;font-size:13px;color:#1e293b}.flex{display:flex}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-between{justify-content:space-between}.text-right{text-align:right}.text-center{text-align:center}.font-bold{font-weight:700}.font-medium{font-weight:500}.text-slate-900{color:#0f172a}.text-slate-700{color:#334155}.text-slate-500{color:#64748b}.text-slate-400{color:#94a3b8}.text-green-600{color:#16a34a}.text-amber-600{color:#d97706}.text-xs{font-size:11px}.text-sm{font-size:12px}.uppercase{text-transform:uppercase}.tracking-wide{letter-spacing:0.05em}.grid{display:grid}.grid-cols-2{grid-template-columns:1fr 1fr}.gap-x-4{column-gap:16px}.gap-y-0\\.5{row-gap:2px}.gap-3{gap:12px}.mb-1{margin-bottom:4px}.pb-3{padding-bottom:12px}.pt-3{padding-top:12px}.space-y-0\\.5>*+*{margin-top:2px}.space-y-3>*+*{margin-top:12px}@media print{body{padding:10px}}</style></head><body>${conteudo}</body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 500);
  };

  return (
    <div style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:9999,backgroundColor:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',boxSizing:'border-box' }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'1rem',boxShadow:'0 25px 60px -12px rgba(0,0,0,0.35)',width:'100%',maxWidth:'38rem',maxHeight:'calc(100vh - 2rem)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.5rem',borderBottom:'1px solid #f1f5f9',flexShrink:0 }}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 style={{ fontSize:'0.9375rem',fontWeight:700,color:'#0f172a',margin:0 }}>Pagamento Confirmado</h2>
          </div>
          <button onClick={onClose} style={{ color:'#94a3b8',background:'none',border:'none',cursor:'pointer',padding:'0.375rem',borderRadius:'0.5rem',display:'flex' }}>
            <X style={{ width:'1.25rem',height:'1.25rem' }} />
          </button>
        </div>
        <div style={{ overflowY:'auto',flex:1,padding:'1.5rem' }}>
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <p className="text-slate-700 font-semibold">Pagamento registrado com sucesso!</p>
            <p className="text-slate-500 text-sm mt-1">Deseja imprimir o recibo para o hospede?</p>
          </div>
          {/* Previa do recibo */}
          <div id="recibo-print" className="border border-slate-200 rounded-xl p-5 bg-white text-sm space-y-3">
            {/* Cabecalho */}
            <div className="flex items-start justify-between pb-3" style={{ borderBottom:'2px solid #e2e8f0' }}>
              <div className="flex items-center gap-3">
                {empresaAtual?.logoUrl && <img src={empresaAtual.logoUrl} alt="Logo" style={{ width:56,height:56,objectFit:'contain' }} />}
                <div>
                  <p className="font-bold text-slate-900">{empresaAtual?.nome || 'Hotel'}</p>
                  {empresaAtual?.cnpj && <p className="text-slate-500 text-xs">CNPJ: {empresaAtual.cnpj}</p>}
                  {empresaAtual?.endereco && <p className="text-slate-500 text-xs">{empresaAtual.endereco}{empresaAtual?.cidade ? `, ${empresaAtual.cidade}` : ''}{empresaAtual?.estado ? ` - ${empresaAtual.estado}` : ''}</p>}
                  {empresaAtual?.telefone && <p className="text-slate-500 text-xs">Tel: {empresaAtual.telefone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700 text-xs uppercase">Recibo de Hospedagem</p>
                <p className="text-slate-400 text-xs">N {reciboData.reservaId?.slice(-6).toUpperCase()}</p>
                <p className="text-slate-400 text-xs">{reciboData.dataPagamento ? new Date(reciboData.dataPagamento+'T12:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {/* Hospede */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Hospede</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                <div><span className="text-slate-500">Nome: </span><span className="font-medium">{reciboData.nomeHospede}</span></div>
                {reciboData.cpf && <div><span className="text-slate-500">CPF: </span><span className="font-medium">{reciboData.cpf}</span></div>}
                {reciboData.telefone && <div><span className="text-slate-500">Tel: </span><span className="font-medium">{reciboData.telefone}</span></div>}
                {reciboData.email && <div><span className="text-slate-500">E-mail: </span><span className="font-medium">{reciboData.email}</span></div>}
              </div>
            </div>
            {/* Estadia */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Estadia</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                <div><span className="text-slate-500">Quarto: </span><span className="font-medium">{reciboData.numeroQuarto}</span></div>
                <div><span className="text-slate-500">Hospedes: </span><span className="font-medium">{reciboData.adultos} adulto(s){reciboData.criancas > 0 ? `, ${reciboData.criancas} crianca(s)` : ''}</span></div>
                <div><span className="text-slate-500">Check-in: </span><span className="font-medium">{toDate(reciboData.dataCheckIn) ? format(toDate(reciboData.dataCheckIn),'dd/MM/yyyy',{locale:ptBR}) : '-'}</span></div>
                <div><span className="text-slate-500">Check-out: </span><span className="font-medium">{toDate(reciboData.dataCheckOut) ? format(toDate(reciboData.dataCheckOut),'dd/MM/yyyy',{locale:ptBR}) : '-'}</span></div>
              </div>
            </div>
            {/* Valores */}
            <div style={{ borderTop:'1px solid #e2e8f0',paddingTop:'0.75rem' }}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Valores</p>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Diarias:</span><span className="font-medium">{formatCurrency(reciboData.valorBase)}</span></div>
                {reciboData.valorExtra > 0 && <div className="flex justify-between"><span className="text-slate-500">Valor extra:</span><span className="font-medium text-amber-600">+ {formatCurrency(reciboData.valorExtra)}</span></div>}
                {reciboData.desconto > 0 && <div className="flex justify-between"><span className="text-slate-500">Desconto:</span><span className="font-medium text-green-600">- {formatCurrency(reciboData.desconto)}</span></div>}
                <div className="flex justify-between font-bold text-slate-900" style={{ borderTop:'1px solid #e2e8f0',paddingTop:'0.375rem',marginTop:'0.25rem' }}>
                  <span>Total Pago:</span><span className="text-green-600">{formatCurrency(reciboData.valorFinal)}</span>
                </div>
              </div>
            </div>
            {/* Pagamento */}
            <div className="text-xs">
              <span className="text-slate-500">Forma de pagamento: </span>
              <span className="font-medium">{FORMAS_PAGAMENTO.find(f=>f.value===reciboData.formaPagamento)?.label || reciboData.formaPagamento}</span>
              {reciboData.parcelas > 1 && <span className="text-slate-500"> — {reciboData.parcelas}x de {formatCurrency(reciboData.valorFinal/reciboData.parcelas)}</span>}
            </div>
            {reciboData.observacoes && <div className="text-xs"><span className="text-slate-500">Obs: </span><span>{reciboData.observacoes}</span></div>}
            {/* Rodape */}
            <div className="text-center pt-3" style={{ borderTop:'1px dashed #cbd5e1' }}>
              <p className="text-xs text-slate-400">Obrigado pela preferencia!</p>
              {empresaAtual?.site && <p className="text-xs text-slate-400">{empresaAtual.site}</p>}
            </div>
          </div>
          {/* Botoes */}
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Fechar sem imprimir</button>
            <button onClick={imprimirRecibo} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2">
              <Printer className="h-4 w-4" /> Imprimir Recibo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
