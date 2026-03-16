import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  label: string
  value: string
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

type StageCardProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
}

export function StageCard({
  eyebrow,
  title,
  description,
  icon: Icon,
}: StageCardProps) {
  return (
    <div className="bg-background/90 p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

type FeatureBulletProps = {
  icon: LucideIcon
  text: string
}

export function FeatureBullet({
  icon: Icon,
  text,
}: FeatureBulletProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-4">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

type SignalCardProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function SignalCard({
  icon: Icon,
  title,
  description,
}: SignalCardProps) {
  return (
    <div className="bg-background/90 p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

type FeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
