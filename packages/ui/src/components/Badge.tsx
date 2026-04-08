import * as React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline" | "gold";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-raised text-slate-300 border border-surface-border",
  success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  danger:  "bg-red-500/20 text-red-300 border border-red-500/30",
  info:    "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  outline: "border border-surface-border text-slate-400",
  gold:    "bg-brand/20 text-brand border border-brand/30",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
