'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ShoppingCart, Search, Plus, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';

export default function CoordinatorOrders() {
  const [search, setSearch] = useState('');
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['coordinator-orders', search],
    queryFn: async () => {
      const res = await api.get(`/orders${search ? `?search=${search}` : ''}`);
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-slate-500">Manage and track all printing orders.</p>
        </div>
        <Button asChild className="gap-2 shadow-md">
          <Link href="/coordinator/orders/new">
            <Plus size={18} />
            New Order
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3 border-b dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search by Order # or Client Name..."
                className="pl-10 bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={16} />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="w-[120px]">Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-bold text-primary">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.client.name}</span>
                      <span className="text-[10px] text-slate-500">{order.client.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.service.name}</TableCell>
                  <TableCell className="text-sm font-medium">{order.quantity} pcs</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/coordinator/orders/${order.id}`}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/20" />
                  </TableRow>
                ))
              )}
              {(!orders || orders.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                    No orders found matching your criteria.
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
