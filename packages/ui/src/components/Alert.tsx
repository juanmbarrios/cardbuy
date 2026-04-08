import * as React from "react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, string> = {
  error: "bg-red-50 border-red-200 text-red-700",
  success: "bg-green-50 border-green-200 text-green-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-700",
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
