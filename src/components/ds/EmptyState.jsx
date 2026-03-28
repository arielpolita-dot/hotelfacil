export function EmptyState({ icon: Icon, message, subMessage, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      {Icon && <Icon className="h-12 w-12 mb-3 opacity-30" />}
      <p className="text-sm font-medium">{message}</p>
      {subMessage && <p className="text-xs mt-1">{subMessage}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
