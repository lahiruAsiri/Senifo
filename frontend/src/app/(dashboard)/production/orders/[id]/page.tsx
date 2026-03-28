'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { 
  Factory, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Loader2,
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  Layers,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ProductionOrderProcess() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expense, setExpense] = useState({ description: '', amount: '' });

  const { data: order, isLoading } = useQuery({
    queryKey: ['production-order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.data,
  });

  const transitionStage = useMutation({
    mutationFn: async (toStatus: string) => (await api.put(`/orders/${id}/stage`, { toStatus })).data,
    onSuccess: () => {
      toast.success('Production stage updated');
      queryClient.invalidateQueries({ queryKey: ['production-order', id] });
    },
  });

  const addExpense = useMutation({
    mutationFn: async (data: any) => (await api.post(`/orders/${id}/expenses`, data)).data,
    onSuccess: () => {
      toast.success('Expense recorded');
      setExpense({ description: '', amount: '' });
      queryClient.invalidateQueries({ queryKey: ['production-order', id] });
    },
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
             <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-slate-400">Specs: {order.service.name} • {order.quantity} pcs • {order.tshirtType}</p>
        </div>
        <div className="flex gap-2">
           {order.status === 'PRODUCTION_QUEUE' && (
             <Button className="gap-2 bg-orange-600 hover:bg-orange-700" onClick={() => transitionStage.mutate('IN_PRODUCTION')} disabled={transitionStage.isPending}>
                Start Production <Factory size={16} />
             </Button>
           )}
           {order.status === 'IN_PRODUCTION' && (
             <Button className="gap-2" onClick={() => transitionStage.mutate('PRODUCTION_REVIEW')} disabled={transitionStage.isPending}>
                Finish Printing <CheckCircle2 size={16} />
             </Button>
           )}
           {order.status === 'PRODUCTION_REVIEW' && (
             <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => transitionStage.mutate('QUALITY_CHECK')} disabled={transitionStage.isPending}>
                Pass Quality Check <CheckCircle2 size={16} />
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="border-b dark:border-slate-800">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="text-primary" size={20} /> Production Specs
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-2 md:grid-cols-3">
                    <div className="p-6 border-r border-b dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Print Color(s)</p>
                       <div className="flex flex-wrap gap-1">
                          {order.colors.map((c: string) => (
                            <Badge key={c} variant="secondary" className="px-2 py-0 text-[10px]">{c}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 border-r border-b dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Garment Type</p>
                       <p className="text-sm font-bold">{order.tshirtType}</p>
                    </div>
                    <div className="p-6 border-b dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Quantity</p>
                       <p className="text-lg font-black text-primary">{order.quantity} pcs</p>
                    </div>
                 </div>
                 <div className="p-6 bg-slate-50 dark:bg-slate-800/20">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-4">Size Distribution Table</p>
                    <div className="grid grid-cols-5 gap-2">
                       {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                         <div key={s} className="flex flex-col items-center bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-3 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400">{s}</span>
                            <span className="text-base font-black">{order.sizes[s] || 0}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="border-b dark:border-slate-800 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <DollarSign className="text-primary" size={20} /> Production Expenses
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">Record any direct costs (extra ink, special material, etc.)</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="pt-6">
                 <div className="space-y-4">
                    {order.expenses?.map((exp: any) => (
                      <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                               <Plus size={14} />
                            </div>
                            <div>
                               <p className="text-xs font-bold">{exp.description}</p>
                               <p className="text-[10px] text-slate-500">{format(new Date(exp.createdAt), 'MMM d, h:mm a')}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-rose-600">LKR {exp.amount.toLocaleString()}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500">
                               <Trash2 size={14} />
                            </Button>
                         </div>
                      </div>
                    ))}
                    {(!order.expenses || order.expenses.length === 0) && (
                      <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 italic text-xs">
                         No expenses recorded for this order yet.
                      </div>
                    )}
                 </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 dark:bg-slate-800/20 border-t dark:border-slate-800 p-6">
                 <div className="flex gap-3 w-full">
                    <div className="flex-1">
                       <Input 
                         placeholder="Expense Description..." 
                         className="h-10 text-xs shadow-sm bg-white dark:bg-slate-900" 
                         value={expense.description}
                         onChange={(e) => setExpense({...expense, description: e.target.value})}
                       />
                    </div>
                    <div className="w-32 relative">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                       <Input 
                         type="number" 
                         placeholder="0.00" 
                         className="h-10 text-xs pl-8 shadow-sm bg-white dark:bg-slate-900" 
                         value={expense.amount}
                         onChange={(e) => setExpense({...expense, amount: e.target.value})}
                       />
                    </div>
                    <Button 
                      className="h-10 gap-2 shadow-md shadow-primary/20" 
                      onClick={() => addExpense.mutate(expense)}
                      disabled={addExpense.isPending || !expense.description || !expense.amount}
                    >
                       {addExpense.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                       Add
                    </Button>
                 </div>
              </CardFooter>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-primary/5 p-4 border-b dark:border-slate-800">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Info size={16} /> Design Reference
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative group cursor-pointer">
                    {order.images?.length > 0 ? (
                      <img src={order.images[0].url} alt="Master Design" className="object-contain w-full h-full p-4" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                         <AlertCircle size={32} className="opacity-10 mb-2" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Master Design</span>
                      </div>
                    )}
                 </div>
                 <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-400 text-[10px] font-bold flex items-center gap-2">
                    <Info size={14} />
                    Final print file must match this reference.
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-slate-900 dark:bg-slate-950 p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-3xl" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Production Status</h4>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Current Phase:</span>
                    <span className="font-bold">{order.status.replace('_', ' ')}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Assigned To:</span>
                    <span className="font-bold">Team Alpha</span>
                 </div>
                 <div className="pt-2">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary transition-all duration-1000" style={{ width: order.status === 'IN_PRODUCTION' ? '50%' : order.status === 'QUALITY_CHECK' ? '90%' : '10%' }} />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
