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
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:bg-gray-50 disabled:cursor-not-allowed",
          error
            ? "border-red-300 bg-red-50 focus:ring-red-400"
            : "border-gray-300 bg-white",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
