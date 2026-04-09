import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-lg border px-3 py-2.5 text-sm transition-colors",
          "text-slate-200 placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50",
          "disabled:bg-surface/50 disabled:cursor-not-allowed disabled:text-slate-500",
          error
            ? "border-red-500/50 bg-red-500/10 focus:ring-red-400/50"
            : "border-surface-border bg-surface",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
