/**
 * Normaliza um Date para meia-noite no horário LOCAL (sem deslocamento de fuso).
 * Isso garante que comparações de dia sejam feitas corretamente independente do UTC.
 */
function normalizeToLocalMidnight(d) {
  if (!d || isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Converte qualquer valor de data para um objeto Date válido normalizado
 * para meia-noite no horário LOCAL.
 * Suporta: Firestore Timestamp, Date, string ISO (YYYY-MM-DD), número (timestamp ms).
 * Retorna null se o valor for inválido.
 */
export function toDate(val) {
  if (!val) return null;

  // Firestore Timestamp tem .toDate()
  if (typeof val.toDate === 'function') {
    const d = val.toDate();
    return normalizeToLocalMidnight(d);
  }

  // Já é Date
  if (val instanceof Date) {
    return normalizeToLocalMidnight(val);
  }

  // String no formato YYYY-MM-DD — parse direto sem UTC para evitar fuso
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  // String ISO completa ou número (timestamp ms)
  const d = new Date(val);
  return normalizeToLocalMidnight(d);
}

/**
 * Formata uma data de forma segura, retornando fallback se inválida.
 */
export function safeFormat(val, formatStr, options = {}) {
  const d = toDate(val);
  if (!d) return options.fallback || '—';
  try {
    const { format } = options;
    if (format) return format(d, formatStr, options);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return options.fallback || '—';
  }
}

/**
 * Retorna o valor de data como string ISO (YYYY-MM-DD) ou null.
 * Usa a data LOCAL (não UTC) para evitar deslocamento de fuso.
 */
export function toDateString(val) {
  const d = toDate(val);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
