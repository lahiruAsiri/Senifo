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
    label?: string;
  };
  color?: 'orange' | 'green' | 'blue' | 'cyan' | 'pink' | 'purple';
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, description, trend, color = 'blue', className }: StatCardProps) {
  const colorMap = {
    orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 border-orange-100 dark:border-orange-500/20',
    green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 border-cyan-100 dark:border-cyan-500/20',
    pink: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-100 dark:border-rose-500/20',
    purple: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 border-violet-100 dark:border-violet-500/20',
  };

  return (
    <Card className={cn("overflow-hidden border-none shadow-sm transition-all hover:shadow-md", colorMap[color], className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-transparent">
        <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-black tracking-tight mb-4">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-3">
             {trend && (
               <div className={cn(
                 "flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm bg-white/80 dark:bg-slate-950/50",
                 trend.isUp ? "text-emerald-600" : "text-rose-600"
               )}>
                 {trend.isUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                 {trend.isUp ? '+' : ''}{trend.value}%
               </div>
             )}
             {(trend?.label || description) && (
               <span className="text-[10px] font-bold opacity-60">
                 {trend?.label || description}
               </span>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
