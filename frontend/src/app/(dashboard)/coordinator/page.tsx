'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { ShoppingCart, Ticket, Calendar, AlertCircle, Clock, CheckCircle2, Factory, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CoordinatorDashboard() {
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['coordinator-orders-recent'],
    queryFn: async () => {
      const res = await api.get('/orders?limit=5');
      return res.data.data;
    },
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['coordinator-tickets-active'],
    queryFn: async () => {
      const res = await api.get('/tickets?status=OPEN');
      return res.data.data;
    },
  });

  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['coordinator-schedule'],
    queryFn: async () => {
      const res = await api.get('/capacity/schedule');
      return res.data.data;
    },
  });

  // Calculate some stats from the orders (mock logic for demo if counts not available)
  const stats = [
    { title: 'Active Orders', value: orders?.length || 0, icon: ShoppingCart, trend: { value: 12, isUp: true } },
    { title: 'Open Tickets', value: tickets?.length || 0, icon: Ticket, trend: { value: 5, isUp: false } },
    { title: 'Scheduled Today', value: 3, icon: Calendar, description: 'Due for production' },
    { title: 'Urgent Issues', value: 1, icon: AlertCircle, className: 'border-l-4 border-l-destructive' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Coordinator Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="text-primary" size={18} />
              Recent Orders
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/coordinator/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border dark:border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-medium text-xs">{order.orderNumber}</TableCell>
                      <TableCell className="text-xs">{order.client.name.split(' ')[0]}</TableCell>
                      <TableCell><OrderStatusBadge status={order.status} className="text-[10px] px-1.5 py-0" /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
                          <Link href={`/coordinator/orders/${order.id}`}>Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-slate-500 text-xs">No recent orders</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="text-primary" size={18} />
              Delivery Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/coordinator/schedule">Full Schedule</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule?.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-800 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item.orderNumber}</p>
                      <p className="text-[10px] text-slate-500">{item.client.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-500">
                      {item.expectedDelivery ? format(new Date(item.expectedDelivery), 'MMM d') : 'Pending'}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", 
                        item.status === 'IN_PRODUCTION' ? "bg-orange-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-[10px] text-slate-400 capitalize">{item.status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!schedule || schedule.length === 0) && (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs">No upcoming deliveries</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="text-primary" size={18} />
            Pending Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {tickets?.slice(0, 3).map((ticket: any) => (
              <Link key={ticket.id} href={`/coordinator/tickets/${ticket.id}`}>
                <div className="p-4 rounded-xl border dark:border-slate-800 hover:border-primary hover:shadow-md transition-all h-full bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{ticket.type.replace('_', ' ')}</Badge>
                    <span className={cn("h-2 w-2 rounded-full", 
                      ticket.priority === 'HIGH' ? "bg-rose-500" : "bg-amber-500"
                    )} />
                  </div>
                  <h5 className="text-sm font-semibold mb-1 line-clamp-1">{ticket.title}</h5>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t pt-2">
                    <span>Order: {ticket.order.orderNumber}</span>
                    <span>{format(new Date(ticket.createdAt), 'MMM d')}</span>
                  </div>
                </div>
              </Link>
            ))}
            {(!tickets || tickets.length === 0) && (
               <div className="col-span-3 h-24 flex items-center justify-center text-slate-500 text-xs">All clear! No open tickets.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
