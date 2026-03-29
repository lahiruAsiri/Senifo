import { Check, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StageLog {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  changedBy: { name: string; role: string };
  notes?: string;
  createdAt: string;
}

export default function StageTimeline({ logs }: { logs: StageLog[] }) {
  if (!logs || logs.length === 0) return (
    <div className="text-center py-8 text-slate-500 text-sm italic">
      No timeline data available yet.
    </div>
  );

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
      {logs.map((log, index) => (
        <div key={log.id} className="relative flex items-start group">
          <div className={cn(
            "absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 transition-colors z-10",
            index === 0 ? "border-primary text-primary" : "border-slate-200 text-slate-400 dark:border-slate-800"
          )}>
            {index === 0 ? <Clock size={18} /> : <Check size={18} />}
          </div>
          <div className="flex-1 ml-14 pt-1 pb-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {log.toStatus.replace('_', ' ')}
              </h4>
              <time className="text-xs text-slate-400">
                {format(new Date(log.createdAt), 'MMM d, h:mm a')}
              </time>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <User size={12} />
              <span>{log.changedBy?.name || 'Unknown'} ({log.changedBy?.role?.replace('_', ' ') || 'N/A'})</span>
            </div>
            {log.notes && (
              <div className="text-xs p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-l-2 border-slate-300 dark:border-slate-700 italic">
                "{log.notes}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
