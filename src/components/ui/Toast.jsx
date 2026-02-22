import Button from "./Button";

function typeClasses(type) {
  if (type === "success") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100";
  }

  if (type === "warning") {
    return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100";
  }

  if (type === "error") {
    return "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-100";
  }

  return "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[min(92vw,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border p-3 shadow-lg transition motion-safe:animate-[fadeIn_180ms_ease-out] ${typeClasses(toast.type)}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
}
