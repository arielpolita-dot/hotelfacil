export function StatusBadge({ status, config }) {
  const cfg = config[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
