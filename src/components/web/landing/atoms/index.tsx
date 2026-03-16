import type { LucideIcon } from 'lucide-react'

type MetricProps = {
  label: string
  value: string
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

type InsightStatProps = {
  value: string
  label: string
  description: string
}

export function InsightStat({
  value,
  label,
  description,
}: InsightStatProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {value}
      </p>
      <p className="mt-3 text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

type FlowPillProps = {
  icon: LucideIcon
  label: string
  detail: string
}

export function FlowPill({ icon: Icon, label, detail }: FlowPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

type PreviewRowProps = {
  icon: LucideIcon
  title: string
  description: string
  meta?: string
}

export function PreviewRow({
  icon: Icon,
  title,
  description,
  meta,
}: PreviewRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">{title}</p>
          {meta ? (
            <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {meta}
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
