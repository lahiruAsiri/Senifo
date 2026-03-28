'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { 
  Users, 
  ShoppingCart, 
  Layers, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import RevenueChart from '@/components/charts/RevenueChart';
import OrdersByStageChart from '@/components/charts/OrdersByStageChart';
import CapacityGauge from '@/components/charts/CapacityGauge';
import { cn } from '@/lib/utils';

export default function SuperAdminOverview() {
  const { data: analytics } = useQuery({
    queryKey: ['super-admin-overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data.data,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['super-admin-recent-orders'],
    queryFn: async () => (await api.get('/orders?limit=10')).data.data,
  });

  const stats = [
    { title: 'Total Revenue', value: 'LKR 1.2M', icon: DollarSign, trend: { value: 24, isUp: true } },
    { title: 'Total Orders', value: analytics?.totalOrders || 0, icon: ShoppingCart, trend: { value: 12, isUp: true } },
    { title: 'Active Users', value: 12, icon: Users, description: 'Internal staff' },
    { title: 'Fleet Capacity', value: '82%', icon: Calendar, trend: { value: 5, isUp: true }, className: 'border-l-4 border-l-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">System Administration</h1>
        <p className="text-slate-500">Global overview of SENIFO operations and system performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                     <TrendingUp className="text-primary" size={20} /> Overall Revenue Performance
                  </CardTitle>
               </div>
               <Button variant="ghost" size="sm" asChild>
                  <Link href="/super-admin/reports">Detailed Analytics</Link>
               </Button>
            </CardHeader>
            <CardContent className="h-80">
               <RevenueChart />
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-l-primary overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="text-primary" size={20} /> Service Utilization
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-4">
                  {[
                    { name: 'Multicolor Screen Print', value: 45, color: 'bg-primary' },
                    { name: 'Plain Screen Print', value: 30, color: 'bg-emerald-500' },
                    { name: 'DTG Print Premium', value: 20, color: 'bg-amber-500' },
                    { name: 'Embroidery', value: 5, color: 'bg-slate-300' },
                  ].map((s) => (
                    <div key={s.name} className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span>{s.name}</span>
                          <span className="text-primary">{s.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", s.color)} style={{ width: `${s.value}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
         <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Global Order Stream</CardTitle>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm">
               <Link href="/super-admin/orders" className="flex items-center gap-2">Review All <ShoppingCart size={14} /></Link>
            </Button>
         </CardHeader>
         <CardContent className="p-0">
            <Table>
               <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow>
                     <TableHead>Order #</TableHead>
                     <TableHead>Client</TableHead>
                     <TableHead>Assigned Coordinator</TableHead>
                     <TableHead>Current Stage</TableHead>
                     <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {recentOrders?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <TableCell className="font-black text-primary text-xs">{order.orderNumber}</TableCell>
                       <TableCell className="text-xs font-semibold">{order.client.name}</TableCell>
                       <TableCell className="text-xs">{order.createdBy?.name || 'Injected'}</TableCell>
                       <TableCell><OrderStatusBadge status={order.status} className="text-[9px]" /></TableCell>
                       <TableCell className="text-right font-black text-xs">LKR {order.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </CardContent>
      </Card>
    </div>
  );
}
