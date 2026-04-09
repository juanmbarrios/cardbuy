interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={["animate-pulse rounded bg-surface-raised", className].join(" ")}
      aria-hidden="true"
    />
  );
}
