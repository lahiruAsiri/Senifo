'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import StatCard from '@/components/shared/StatCard';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PaymentReports() {
  const [dateRange, setDateRange] = useState({ 
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['payment-report', dateRange],
    queryFn: async () => {
      const res = await api.get(`/analytics/revenue?start=${dateRange.start}&end=${dateRange.end}`);
      return res.data.data;
    },
  });

  const summaries = [
    { title: 'Gross Revenue', value: 'LKR 842,000', icon: DollarSign, trend: { value: 12, isUp: true } },
    { title: 'Direct Costs', value: 'LKR 312,500', icon: ArrowDownRight, trend: { value: 5, isUp: false }, className: 'text-rose-600' },
    { title: 'Net Profit', value: 'LKR 529,500', icon: ArrowUpRight, trend: { value: 18, isUp: true }, className: 'text-emerald-600' },
    { title: 'Orders count', value: 48, icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Reports</h1>
          <p className="text-slate-500 text-sm">Detailed breakdown of revenue, costs, and profit margins.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border dark:border-slate-800">
              <Input 
                type="date" 
                className="h-8 text-[10px] w-32 border-none bg-transparent" 
                value={dateRange.start}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({...dateRange, start: e.target.value})}
              />
              <span className="text-[10px] text-slate-400 font-bold uppercase">to</span>
              <Input 
                type="date" 
                className="h-8 text-[10px] w-32 border-none bg-transparent" 
                value={dateRange.end}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({...dateRange, end: e.target.value})}
              />
           </div>
           <Button variant="outline" size="sm" className="gap-2">
              <Download size={16} /> Export CSV
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaries.map((stat, i) => (
          <StatCard key={i} {...stat} description="Compared to last month" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900 border-t-4 border-t-primary">
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="text-primary" size={20} /> Revenue Trend
               </CardTitle>
               <CardDescription className="text-xs">Consolidated daily revenue for the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center text-slate-400 italic text-sm">
               {/* Recharts RevenueChart will be implemented in Phase 13 */}
               <div className="flex flex-col items-center gap-2 opacity-20">
                  <TrendingUp size={48} />
                  <span>Revenue visualization data loading...</span>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b dark:border-slate-800">
               <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="text-primary" size={20} /> Profit by Service
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <div className="space-y-6">
                  {[
                    { name: 'Screen Printing', value: 65, color: 'bg-primary' },
                    { name: 'DTG Printing', value: 25, color: 'bg-emerald-500' },
                    { name: 'Sublimation', value: 10, color: 'bg-amber-500' },
                  ].map((s) => (
                    <div key={s.name} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span>{s.name}</span>
                          <span className="text-slate-400">{s.value}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", s.color)} style={{ width: `${s.value}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800">
           <CardTitle className="text-base font-bold">Order Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                 <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Total Rev</TableHead>
                    <TableHead>Direct Cost</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {[
                   { id: 'SNF-2024-001', service: 'Screen Print', rev: 45000, cost: 18000 },
                   { id: 'SNF-2024-002', service: 'DTG Print', rev: 12000, cost: 7500 },
                   { id: 'SNF-2024-003', service: 'Screen Print', rev: 85000, cost: 32000 },
                 ].map((row) => (
                   <TableRow key={row.id}>
                      <TableCell className="font-bold text-xs">{row.id}</TableCell>
                      <TableCell className="text-xs">{row.service}</TableCell>
                      <TableCell className="text-xs font-black">LKR {row.rev.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-rose-500">LKR {row.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-600 font-bold">LKR {(row.rev - row.cost).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-black text-xs">{Math.round(((row.rev - row.cost)/row.rev)*100)}%</TableCell>
                   </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}
