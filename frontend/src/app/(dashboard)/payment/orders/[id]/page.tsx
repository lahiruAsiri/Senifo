'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Info,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PaymentOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState({ amount: '', method: 'CASH', reference: '' });

  const { data: order, isLoading } = useQuery({
    queryKey: ['payment-order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.data,
  });

  const recordPayment = useMutation({
    mutationFn: async (data: any) => (await api.post(`/payments`, { orderId: id, ...data })).data,
    onSuccess: () => {
      toast.success('Payment recorded successfully!');
      setPayment({ amount: '', method: 'CASH', reference: '' });
      queryClient.invalidateQueries({ queryKey: ['payment-order', id] });
    },
  });

  const transitionStage = useMutation({
    mutationFn: async (toStatus: string) => (await api.put(`/orders/${id}/stage`, { toStatus })).data,
    onSuccess: () => {
      toast.success('Order stage updated');
      queryClient.invalidateQueries({ queryKey: ['payment-order', id] });
    },
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!order) return <div>Order not found</div>;

  const balance = order.totalAmount - order.paidAmount;
  const isFullyPaid = balance <= 0;

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
          <p className="text-xs text-slate-400">Client: {order.client.name} • Total Order: LKR {order.totalAmount.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
           {order.status === 'PAYMENT_PENDING' && isFullyPaid && (
             <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => transitionStage.mutate('PAYMENT_CLEARED')} disabled={transitionStage.isPending}>
                Clear Payment <CheckCircle2 size={16} />
             </Button>
           )}
           {order.status === 'PAYMENT_CLEARED' && (
             <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => transitionStage.mutate('COMPLETED')} disabled={transitionStage.isPending}>
                Finalize & Close Order <CheckCircle2 size={16} />
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-l-primary">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Invoice</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-black text-slate-900 dark:text-slate-100">LKR {order.totalAmount.toLocaleString()}</div>
                    <div className="flex items-center gap-2 mt-2">
                       <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20">
                          Paid: LKR {order.paidAmount.toLocaleString()}
                       </Badge>
                       {balance > 0 && (
                         <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-100 bg-rose-50 dark:bg-rose-950/20">
                            Due: LKR {balance.toLocaleString()}
                         </Badge>
                       )}
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-slate-900 dark:bg-slate-950 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full -mr-8 -mt-8 blur-2xl" />
                 <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Estimated Profit</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-3xl font-black text-emerald-400">LKR {(order.totalAmount * 0.4).toLocaleString()}</div>
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                       <TrendingUp size={12} /> ~40% margin based on pricing tier
                    </p>
                 </CardContent>
              </Card>
           </div>

           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="border-b dark:border-slate-800 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Receipt className="text-primary" size={20} /> Transaction History
                    </CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 {order.payments?.length > 0 ? (
                    <div className="divide-y dark:divide-slate-800">
                       {order.payments.map((p: any) => (
                         <div key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                  <CreditCard size={18} />
                               </div>
                               <div>
                                  <p className="text-sm font-bold">LKR {p.amount.toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{p.method} • {p.reference || 'No Ref'}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-slate-400">{format(new Date(p.createdAt), 'MMM d, h:mm a')}</p>
                               <Badge variant="outline" className="text-[9px] h-4 mt-1">VERIFIED</Badge>
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-12 text-center text-slate-400 italic text-xs">No payments recorded yet.</div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-primary/10">
              <CardHeader className="bg-primary/5 p-4 border-b dark:border-slate-800 text-center">
                 <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Record New Payment</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Payment Amount (LKR)</Label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">LKR</span>
                       <Input 
                         type="number" 
                         className="pl-12 h-12 text-lg font-black border-2 border-primary/20 focus:border-primary" 
                         value={payment.amount}
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayment({...payment, amount: e.target.value})}
                         placeholder={balance.toString()}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Method</Label>
                       <select 
                         className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold"
                         value={payment.method}
                         onChange={(e) => setPayment({...payment, method: e.target.value})}
                       >
                          <option value="CASH">Cash</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="CARD">Card</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase text-slate-400">Reference #</Label>
                       <Input 
                         className="h-10 text-xs" 
                         placeholder="ID / TXN" 
                         value={payment.reference}
                         onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayment({...payment, reference: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="pt-2">
                    <Button 
                      className="w-full h-12 gap-2 text-sm font-bold shadow-lg shadow-primary/20" 
                      onClick={() => recordPayment.mutate(payment)}
                      disabled={recordPayment.isPending || !payment.amount}
                    >
                       {recordPayment.isPending ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={18} />}
                       Confirm & Record Payment
                    </Button>
                 </div>
              </CardContent>
              <CardFooter className="bg-slate-50 dark:bg-slate-800/20 p-4 flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <Info size={14} />
                 </div>
                 <p className="text-[10px] text-slate-500 leading-tight">Payments are recorded against the order total. Direct deposit details should match the reference number.</p>
              </CardFooter>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b">Finance Info</h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-slate-400 mt-1" />
                    <div>
                       <p className="text-xs font-bold">Billing Cycle</p>
                       <p className="text-[10px] text-slate-500">{format(new Date(), 'MMMM yyyy')}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <FileText size={16} className="text-slate-400 mt-1" />
                    <div>
                       <p className="text-xs font-bold">Tax Reference</p>
                       <p className="text-[10px] text-slate-500">VAT-77283-991</p>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
