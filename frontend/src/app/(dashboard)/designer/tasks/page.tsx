'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Palette, Search, Filter, Layers, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function DesignerTasks() {
  const [filter, setFilter] = useState('ALL');
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['designer-tasks', filter],
    queryFn: async () => {
      const statusParam = filter === 'ALL' ? 'DESIGN_QUEUE,DESIGNING,DESIGN_REVIEW,DESIGN_APPROVED' : filter;
      const res = await api.get(`/orders?status=${statusParam}`);
      return res.data.data;
    },
  });

  const filterButtons = [
    { label: 'All Tasks', value: 'ALL' },
    { label: 'Queue', value: 'DESIGN_QUEUE' },
    { label: 'In Progress', value: 'DESIGNING' },
    { label: 'Review', value: 'DESIGN_REVIEW' },
    { label: 'Approved', value: 'DESIGN_APPROVED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Tasks</h1>
          <p className="text-slate-500 text-sm">Manage your design queue and approvals.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border dark:border-slate-800">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filter === btn.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(btn.value)}
              className={cn("text-[10px] h-8 font-bold uppercase tracking-wider px-3", filter === btn.value && "shadow-sm")}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="w-[120px]">Order #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks?.map((task: any) => (
                <TableRow key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-bold text-primary">{task.orderNumber}</TableCell>
                  <TableCell className="text-xs">
                     <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-400" />
                        <span>{task.service.name} • {task.tshirtType}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{task.quantity} pcs</TableCell>
                  <TableCell className="text-xs">{task.client.name}</TableCell>
                  <TableCell>
                     <div className={cn("flex items-center gap-1.5 text-[10px] font-bold", 
                       new Date(task.expectedDelivery) < new Date() ? "text-rose-500" : "text-slate-500"
                     )}>
                        <Clock size={12} />
                        {task.expectedDelivery ? format(new Date(task.expectedDelivery), 'MMM d') : 'N/A'}
                     </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={task.status} className="text-[9px] px-1.5 py-0" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs px-3 shadow-sm border-primary/20 hover:bg-primary/5">
                      <Link href={`/designer/orders/${task.id}`}>Open Studio</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/10" />
                </TableRow>
              ))}
              {(!tasks || tasks.length === 0) && !isLoading && (
                <TableRow>
                   <TableCell colSpan={7} className="h-48 text-center text-slate-500 text-xs italic">
                      No design tasks found for target filter.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
