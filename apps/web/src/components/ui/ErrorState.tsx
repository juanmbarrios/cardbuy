"use client";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "No hemos podido cargar el contenido. Inténtalo de nuevo.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={["flex flex-col items-center justify-center py-20 px-4 text-center", className].join(" ")}
      data-testid="error-state"
      role="alert"
    >
      <span className="text-5xl mb-4" aria-hidden="true">⚠️</span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-lg border border-surface-border bg-surface px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-surface-hover hover:border-brand/50 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
