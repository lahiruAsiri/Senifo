'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { Factory, Clock, CheckCircle2, AlertCircle, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProductionDashboard() {
  const { data: activeProduction } = useQuery({
    queryKey: ['production-active'],
    queryFn: async () => {
      const res = await api.get('/orders?status=IN_PRODUCTION');
      return res.data.data;
    },
  });

  const { data: queue } = useQuery({
    queryKey: ['production-queue'],
    queryFn: async () => {
      const res = await api.get('/orders?status=PRODUCTION_QUEUE');
      return res.data.data;
    },
  });

  const stats = [
    { title: 'In Production', value: activeProduction?.length || 0, icon: Factory, trend: { value: 5, isUp: true } },
    { title: 'Queue', value: queue?.length || 0, icon: Clock, trend: { value: 10, isUp: false } },
    { title: 'Quality Check', value: 2, icon: CheckCircle2, description: 'Pending clearance' },
    { title: 'Issues', value: 0, icon: AlertCircle, className: 'border-l-4 border-l-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Production Floor</h1>
        <p className="text-slate-500">Real-time monitoring of printing operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
           <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Factory className="text-primary" size={20} /> Current Production
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              {activeProduction?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                         <Factory size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold">{order.orderNumber}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-bold">{order.service.name} • {order.quantity} pcs</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] text-slate-500">Started: {format(new Date(order.updatedAt), 'MMM d')}</p>
                         <p className="text-[10px] font-bold text-primary">Deadline: {order.expectedDelivery ? format(new Date(order.expectedDelivery), 'MMM d') : 'N/A'}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs px-3 border-orange-200 hover:bg-orange-50 dark:border-orange-900/30 dark:hover:bg-orange-900/10">
                         <Link href={`/production/orders/${order.id}`}>Update</Link>
                      </Button>
                   </div>
                </div>
              ))}
              {(!activeProduction || activeProduction.length === 0) && (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm italic">
                   No orders currently in production.
                </div>
              )}
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
           <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Clock className="text-primary" size={20} /> Queued for Production
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              {queue?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-b last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                         <Package size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold">{order.orderNumber}</p>
                         <p className="text-[10px] text-slate-500 uppercase font-bold">{order.service.printType.replace('_', ' ')}</p>
                      </div>
                   </div>
                   <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                      <Link href={`/production/orders/${order.id}`}>View Specs</Link>
                   </Button>
                </div>
              ))}
              {(!queue || queue.length === 0) && (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm italic">
                   Queue is empty. Ready for more!
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
