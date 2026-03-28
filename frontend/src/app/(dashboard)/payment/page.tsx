'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { CreditCard, Wallet, Banknote, TrendingUp, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PaymentDashboard() {
  const { data: pendingPayments } = useQuery({
    queryKey: ['payment-pending'],
    queryFn: async () => {
      const res = await api.get('/orders?status=PAYMENT_PENDING');
      return res.data.data;
    },
  });

  const { data: clearedPayments } = useQuery({
    queryKey: ['payment-cleared'],
    queryFn: async () => {
      const res = await api.get('/orders?status=PAYMENT_CLEARED,COMPLETED');
      return res.data.data;
    },
  });

  const stats = [
    { title: 'Pending Collection', value: 'LKR 45,200', icon: Wallet, trend: { value: 15, isUp: true } },
    { title: 'MTD Revenue', value: 'LKR 284,500', icon: CreditCard, trend: { value: 8, isUp: true } },
    { title: 'Completed Payouts', value: clearedPayments?.length || 0, icon: CheckCircle2, description: 'Ready for profit report' },
    { title: 'Avg. Profit Margin', value: '38%', icon: TrendingUp, className: 'border-l-4 border-l-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Desk</h1>
          <p className="text-slate-500">Manage order payments, invoicing, and profit tracking.</p>
        </div>
        <Button asChild className="gap-2">
           <Link href="/payment/reports"><TrendingUp size={18} /> Financial Reports</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
           <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Banknote className="text-primary" size={20} /> Pending Payments
              </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <TableCell className="font-bold">{order.orderNumber}</TableCell>
                      <TableCell className="text-xs">{order.client.name.split(' ')[0]}</TableCell>
                      <TableCell className="text-xs font-medium">LKR {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-600 font-bold">LKR {order.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-rose-600 font-bold">LKR {(order.totalAmount - order.paidAmount).toLocaleString()}</TableCell>
                      <TableCell><OrderStatusBadge status={order.status} className="text-[10px]" /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs px-3 shadow-sm border-primary/20 hover:bg-primary/5">
                           <Link href={`/payment/orders/${order.id}`}>Record Payment</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!pendingPayments || pendingPayments.length === 0) && (
                    <TableRow>
                       <TableCell colSpan={7} className="h-48 text-center text-slate-500 text-sm italic">
                          No pending payments at this time.
                       </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
