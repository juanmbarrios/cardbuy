import * as React from "react";

type ButtonVariant = "primary" | "brand" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Naranja — CTA principal
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-glow-accent disabled:bg-accent/40",
  // Dorado — acciones de marca
  brand:
    "bg-brand text-bg font-bold hover:bg-brand-light shadow-glow-gold disabled:bg-brand/40",
  // Contorno oscuro — acción secundaria
  secondary:
    "bg-transparent text-slate-200 border border-surface-border hover:bg-surface hover:border-brand/50 disabled:opacity-40",
  // Sin fondo — navegación y acciones terciarias
  ghost:
    "bg-transparent text-slate-300 hover:bg-surface hover:text-white disabled:opacity-40",
  // Rojo — acciones destructivas
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

function Spinner({ size }: { size: "sm" }) {
  return (
    <svg
      className={`animate-spin ${size === "sm" ? "h-4 w-4" : "h-5 w-5"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
