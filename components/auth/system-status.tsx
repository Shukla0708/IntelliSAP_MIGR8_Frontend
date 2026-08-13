export function SystemStatus() {
  return (
    <div className="mt-6 flex items-center justify-center space-x-2 text-on-surface-variant/70">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
    </div>
  );
}
