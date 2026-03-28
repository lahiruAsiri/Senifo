'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import StageTimeline from '@/components/shared/StageTimeline';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  AlertCircle, 
  Calendar, 
  User, 
  UserPlus, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  Loader2,
  Factory
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.data,
  });

  const { data: timeline } = useQuery({
    queryKey: ['order-timeline', id],
    queryFn: async () => (await api.get(`/orders/${id}/timeline`)).data.data,
  });

  const generateInvoice = useMutation({
    mutationFn: async () => (await api.post(`/invoices/generate/${id}`)).data,
    onSuccess: (res) => {
      toast.success('Invoice generated successfully!');
      window.open(res.data.invoiceUrl, '_blank');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  const transitionStage = useMutation({
    mutationFn: async (toStatus: string) => (await api.put(`/orders/${id}/stage`, { toStatus })).data,
    onSuccess: () => {
      toast.success('Order stage updated');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', id] });
    },
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!order) return <div>Order not found</div>;

  const nextStageMap: Record<string, string> = {
    'PENDING': 'DESIGN_QUEUE',
    'DESIGN_APPROVED': 'PRODUCTION_QUEUE',
  };

  const nextStage = nextStageMap[order.status];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-slate-500 text-sm">Created on {format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.invoiceUrl ? (
            <Button variant="outline" className="gap-2" asChild>
              <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                <Download size={16} /> Invoice
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="gap-2" onClick={() => generateInvoice.mutate()} disabled={generateInvoice.isPending}>
              {generateInvoice.isPending ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Generate Invoice
            </Button>
          )}
          {nextStage && (
            <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => transitionStage.mutate(nextStage)} disabled={transitionStage.isPending}>
              Move to {nextStage.replace('_', ' ')}
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
             <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
               <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Order Information</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Service:</span>
                   <span className="font-semibold">{order.service.name}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Printing Type:</span>
                   <Badge variant="outline" className="text-[10px]">{order.service.printType.replace('_', ' ')}</Badge>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">T-Shirt Type:</span>
                   <span className="font-semibold">{order.tshirtType}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Total Quantity:</span>
                   <span className="font-bold text-primary">{order.quantity} pcs</span>
                 </div>
                 <div className="pt-2 border-t dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Size Breakdown</p>
                    <div className="flex gap-4">
                       {Object.entries(order.sizes).map(([s, q]: any) => q > 0 && (
                         <div key={s} className="flex flex-col items-center p-2 rounded bg-slate-50 dark:bg-slate-800 min-w-[40px]">
                           <span className="text-[10px] text-slate-400">{s}</span>
                           <span className="font-bold text-xs">{q}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
               <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Client Info</CardTitle>
               </CardHeader>
               <CardContent className="pt-4 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                       <User size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold">{order.client.name}</p>
                       <p className="text-xs text-slate-500">{order.client.company || 'Individual'}</p>
                    </div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <AlertCircle size={14} className="text-slate-400" />
                       {order.client.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <Calendar size={14} className="text-slate-400" />
                       Expected: {order.expectedDelivery ? format(new Date(order.expectedDelivery), 'PPP') : 'Not Set'}
                    </div>
                 </div>
                 <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href={`/coordinator/clients/${order.clientId}`}>View All Activity</Link>
                 </Button>
               </CardContent>
             </Card>
          </div>

          <Tabs defaultValue="images" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-800">
              <TabsTrigger value="images" className="gap-2"><ImageIcon size={16} /> Reference Images</TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2"><TicketIcon size={16} /> Issues & Tickets</TabsTrigger>
            </TabsList>
            <TabsContent value="images" className="mt-4">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6">
                {order.images?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {order.images.map((img: any) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border dark:border-slate-800 group cursor-pointer">
                         <img src={img.url} alt={img.fileName} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                         <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white truncate">{img.fileName}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm">No reference images uploaded yet.</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="tickets" className="mt-4">
               <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6">
                 {/* Ticket list component would go here */}
                 <div className="flex flex-col items-center justify-center py-12 text-slate-400 border border-dashed rounded-xl">
                    <CheckCircle2 size={32} className="mb-2 text-emerald-500 opacity-50" />
                    <p className="text-sm">No active tickets for this order.</p>
                    <Button variant="ghost" size="sm" className="mt-4 text-primary">Raise a Ticket</Button>
                 </div>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Clock size={16} /> Progress Timeline
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                 <StageTimeline logs={timeline} />
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 overflow-hidden">
              <div className="bg-primary p-3 flex items-center gap-2 text-primary-foreground">
                 <AlertCircle size={16} />
                 <span className="text-xs font-bold uppercase tracking-wider">Order Management</span>
              </div>
              <CardContent className="p-4 space-y-3">
                 <p className="text-xs text-slate-600 dark:text-slate-400">Assignment:</p>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm p-2 rounded bg-white dark:bg-slate-800 border dark:border-slate-700">
                       <User size={14} className="text-slate-400" />
                       <span className="font-medium text-xs">Designer: {order.designer?.name || 'Unassigned'}</span>
                       {!order.designerId && <Button variant="link" size="sm" className="h-4 p-0 ml-auto text-[10px]">Assign</Button>}
                    </div>
                    <div className="flex items-center gap-2 text-sm p-2 rounded bg-white dark:bg-slate-800 border dark:border-slate-700">
                       <Factory size={14} className="text-slate-400" />
                       <span className="font-medium text-xs">Production: Waiting</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
