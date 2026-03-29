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
  AlertCircle,
  Package
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
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
  const { user } = useAuthStore();
  const { data: analytics } = useQuery({
    queryKey: ['super-admin-overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data.data,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['super-admin-recent-orders'],
    queryFn: async () => (await api.get('/orders?limit=5')).data.data,
  });

  const stats = [
    { title: 'Ecommerce Revenue', value: '$245,450', color: 'orange', trend: { value: 14.9, isUp: true, label: '(+43.21%)' } },
    { title: 'New Customers', value: '684', color: 'green', trend: { value: 8.6, isUp: false } },
    { title: 'Repeat Purchase Rate', value: '75.12%', color: 'blue', trend: { value: 25.4, isUp: true, label: '(+20.11%)' } },
    { title: 'Average Order Value', value: '$2,412.23', color: 'cyan', trend: { value: 35.2, isUp: true, label: '(+$754)' } },
  ];

  const topProducts = [
    { name: 'Snicker Vento', id: '2441310', sales: '128 Sales', image: '/assets/product-1.png' },
    { name: 'Blue Backpack', id: '1241318', sales: '401 Sales', image: '/assets/product-2.png' },
    { name: 'Water Bottle', id: '8441573', sales: '1K+ Sales', image: '/assets/product-3.png' },
  ];

  const topCustomers = [
    { name: 'Marks Hoverson', orders: '25 Orders', image: '/assets/customer-1.png' },
    { name: 'Marks Hoverson', orders: '15 Orders', image: '/assets/customer-2.png' },
    { name: 'Jhony Peters', orders: '23 Orders', image: '/assets/customer-3.png' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-slate-500 font-normal">Here&apos;s what happening with your store today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat as any} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
         {/* Summary Chart */}
         <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
               <div>
                  <CardTitle className="text-xl font-bold">Summary</CardTitle>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-xs font-semibold text-slate-500">Order</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500" />
                     <span className="text-xs font-semibold text-slate-500">Income Growth</span>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4 rounded-xl font-semibold bg-slate-50 dark:bg-slate-800 border-none">
                     Last 7 days
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <RevenueChart />
            </CardContent>
         </Card>

         {/* Most Selling Products */}
         <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
               <CardTitle className="text-xl font-bold">Most Selling Products</CardTitle>
               <Button variant="ghost" size="icon" className="text-slate-400">...</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               {topProducts.map((product, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          <Package className="text-slate-400" size={24} />
                       </div>
                       <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">ID: {product.id}</p>
                       </div>
                    </div>
                    <span className="text-xs font-bold">{product.sales}</span>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Recent Orders Table */}
         <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
               <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
               <Button variant="outline" size="sm" className="rounded-xl font-semibold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50">
                  View All
               </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
               <Table>
                  <TableHeader>
                     <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="px-8 py-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Product</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Customer</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Order ID</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Date</TableHead>
                        <TableHead className="py-4 font-semibold text-slate-400 uppercase text-[10px] tracking-widest">Status</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {(recentOrders || []).map((order: any, i: number) => (
                       <TableRow key={i} className="border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="px-8 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                                   <Package size={16} className="text-orange-600" />
                                </div>
                                <span className="text-xs font-semibold">Water Bottle</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-blue-600">{order.client.name.split(' ')[0]} {order.client.name.split(' ')[1] || 'Jack'}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-400">#{order.orderNumber}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-400">27 Jun 2025</TableCell>
                          <TableCell>
                             <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ring-1 ring-inset",
                                order.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20" : 
                                order.status === 'PENDING' ? "bg-amber-50 text-amber-600 ring-amber-500/20" : 
                                "bg-rose-50 text-rose-600 ring-rose-500/20"
                             )}>
                                <div className={cn(
                                   "w-1.5 h-1.5 rounded-full",
                                   order.status === 'COMPLETED' ? "bg-emerald-500" : order.status === 'PENDING' ? "bg-amber-500" : "bg-rose-500"
                                )} />
                                {order.status}
                             </div>
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         {/* Weekly Top Customers */}
         <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
               <CardTitle className="text-xl font-bold">Weekly Top Customers</CardTitle>
               <Button variant="ghost" size="icon" className="text-slate-400">...</Button>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               {topCustomers.map((customer, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          <Users className="text-slate-400" size={20} />
                       </div>
                       <div>
                          <p className="font-semibold text-sm">{customer.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{customer.orders}</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50">View</Button>
                 </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
