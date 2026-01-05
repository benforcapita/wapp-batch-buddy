import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-slide-up",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "mt-1 text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className="rounded-lg bg-accent p-3 text-accent-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}
