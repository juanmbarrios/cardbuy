import * as React from "react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  error:   "bg-red-500/15 border-red-500/30 text-red-300",
  success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  info:    "bg-blue-500/15 border-blue-500/30 text-blue-300",
};

export function Alert({ variant = "error", children, className = "" }: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        "rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
