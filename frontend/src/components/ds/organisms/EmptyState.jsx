import { Button } from '../atoms/Button';

export function EmptyState({ icon: Icon, message, subMessage, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      {Icon && <Icon className="h-12 w-12 mb-3 opacity-30" />}
      <p className="text-sm font-medium">{message}</p>
      {subMessage && <p className="text-xs mt-1">{subMessage}</p>}
      {action && (
        <div className="mt-4">
          <Button variant="ghost" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
