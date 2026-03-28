'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { Palette, Clock, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DesignerDashboard() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['designer-active-orders'],
    queryFn: async () => {
      const res = await api.get('/orders?status=DESIGNING');
      return res.data.data;
    },
  });

  const { data: queue } = useQuery({
    queryKey: ['designer-queue'],
    queryFn: async () => {
      const res = await api.get('/orders?status=DESIGN_QUEUE');
      return res.data.data;
    },
  });

  const stats = [
    { title: 'In Progress', value: orders?.length || 0, icon: Palette, trend: { value: 8, isUp: true } },
    { title: 'Design Queue', value: queue?.length || 0, icon: Clock, trend: { value: 2, isUp: false } },
    { title: 'Approved Today', value: 4, icon: CheckCircle2, description: 'Ready for production' },
    { title: 'Active Tickets', value: 2, icon: AlertCircle, className: 'border-l-4 border-l-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Designer Dashboard</h1>
          <p className="text-slate-500">Transform client visions into print-ready reality.</p>
        </div>
        <Button asChild className="gap-2">
           <Link href="/designer/tasks"><Palette size={18} /> View Task Queue</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-primary" size={18} />
              Current Design Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{order.service?.name}</TableCell>
                    <TableCell>{order.expectedDelivery ? format(new Date(order.expectedDelivery), 'MMM d') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/designer/orders/${order.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!orders || orders.length === 0) && (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm italic bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 mt-4">
                <ShoppingCart size={32} className="opacity-10 mb-2" />
                <span>You have no active design tasks. Check the queue!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
