import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className = "", children, ...props }: LabelProps) {
  return (
    <label
      className={["block text-sm font-medium text-slate-300 mb-1", className].join(" ")}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
