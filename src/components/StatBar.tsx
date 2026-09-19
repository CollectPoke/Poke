export function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="mono-num text-xs text-foreground">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
