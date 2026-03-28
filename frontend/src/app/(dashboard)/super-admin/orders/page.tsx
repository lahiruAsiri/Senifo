'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ShoppingCart, Search, Filter, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';

export default function SuperAdminOrders() {
  const [search, setSearch] = useState('');
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['super-admin-orders-all', search],
    queryFn: async () => {
      const res = await api.get(`/orders${search ? `?search=${search}` : ''}`);
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Order Management</h1>
          <p className="text-slate-500 text-sm">Complete visibility into every order in the SENIFO ecosystem.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 shadow-sm">
              <Download size={16} /> Export CSV
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="pb-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search Order #, Client, Coordinator..."
                className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={16} /> Filters
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="w-[120px]">Order #</TableHead>
                <TableHead>Client & Company</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-black text-primary text-xs">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="font-bold text-xs">{order.client.name}</span>
                       <span className="text-[10px] text-slate-500">{order.client.company || 'Individual'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{order.createdBy?.name || 'Injected'}</TableCell>
                  <TableCell className="text-xs font-black">LKR {order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} className="text-[9px]" />
                  </TableCell>
                  <TableCell className="text-[10px] text-slate-400">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                       <ExternalLink size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="h-12 animate-pulse bg-slate-100/50 dark:bg-slate-800/10" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
