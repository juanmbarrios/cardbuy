import Link from "next/link";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon = "🃏",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-20 px-4 text-center",
        className,
      ].join(" ")}
      data-testid="empty-state"
    >
      <span className="text-5xl mb-4" aria-hidden="true">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow-accent hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
