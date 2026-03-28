import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend.value === 0 ? "text-slate-400" : trend.isUp ? "text-emerald-500" : "text-rose-500"
              )}>
                {trend.value === 0 ? <Minus size={12} className="mr-0.5" /> : trend.isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <div className="h-1 w-full bg-primary/5" />
    </Card>
  );
}
