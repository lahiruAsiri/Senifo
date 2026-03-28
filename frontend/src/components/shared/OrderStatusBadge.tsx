import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OrderStatus =
  | 'PENDING' | 'DESIGN_QUEUE' | 'DESIGNING' | 'DESIGN_REVIEW' | 'DESIGN_APPROVED'
  | 'PRODUCTION_QUEUE' | 'IN_PRODUCTION' | 'PRODUCTION_REVIEW' | 'QUALITY_CHECK'
  | 'PAYMENT_PENDING' | 'PAYMENT_CLEARED' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  DESIGN_QUEUE: { label: 'Design Queue', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  DESIGNING: { label: 'Designing', className: 'bg-blue-500 text-white' },
  DESIGN_REVIEW: { label: 'Design Review', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  DESIGN_APPROVED: { label: 'Design Approved', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  PRODUCTION_QUEUE: { label: 'Production Queue', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  IN_PRODUCTION: { label: 'In Production', className: 'bg-orange-500 text-white' },
  PRODUCTION_REVIEW: { label: 'Prod. Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  QUALITY_CHECK: { label: 'Quality Check', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  PAYMENT_PENDING: { label: 'Payment Pending', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse' },
  PAYMENT_CLEARED: { label: 'Payment Cleared', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-600 text-white' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <Badge className={cn('font-semibold border-none', config.className, className)}>
      {config.label}
    </Badge>
  );
}
