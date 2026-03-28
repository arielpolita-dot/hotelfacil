const SIZES = {
  sm: 'w-6 h-6 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-16 h-16 border-4',
};

export function LoadingSpinner({ size = 'md', message }) {
  return (
    <div className="flex flex-col items-center justify-center h-48" role="status">
      <div className={`${SIZES[size] || SIZES.md} border-blue-600 border-t-transparent rounded-full animate-spin`} />
      {message && <p className="text-sm text-slate-500 mt-3">{message}</p>}
    </div>
  );
}
