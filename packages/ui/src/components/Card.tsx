import * as React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  glow?: boolean;
}

export function Card({ children, className = "", padding = true, glow = false }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-surface-border bg-surface shadow-sm",
        "transition-all duration-200",
        glow ? "hover:border-brand/40 hover:shadow-glow-card" : "hover:border-surface-raised",
        padding ? "p-6" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["mb-4", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={["text-lg font-semibold text-white", className].join(" ")}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["mt-4 pt-4 border-t border-surface-border", className].join(" ")}>
      {children}
    </div>
  );
}
