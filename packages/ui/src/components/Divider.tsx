import * as React from "react";

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = "" }: DividerProps) {
  if (label) {
    return (
      <div className={["flex items-center gap-3", className].join(" ")}>
        <div className="flex-1 border-t border-surface-border" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="flex-1 border-t border-surface-border" />
      </div>
    );
  }

  return <hr className={["border-t border-surface-border", className].join(" ")} />;
}
