'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { 
  Palette, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  Ticket as TicketIcon,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Info,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function DesignerOrderStudio() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['designer-order', id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.data,
  });

  const transitionStage = useMutation({
    mutationFn: async (toStatus: string) => (await api.put(`/orders/${id}/stage`, { toStatus })).data,
    onSuccess: () => {
      toast.success('Design stage updated');
      queryClient.invalidateQueries({ queryKey: ['designer-order', id] });
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
          <p className="text-xs text-slate-400">Assignment: {order.service.name} • {order.quantity} pcs • {order.tshirtType}</p>
        </div>
        <div className="flex gap-2">
           {order.status === 'DESIGN_QUEUE' && (
             <Button className="gap-2" onClick={() => transitionStage.mutate('DESIGNING')} disabled={transitionStage.isPending}>
                Accept Task <ChevronRight size={16} />
             </Button>
           )}
           {order.status === 'DESIGNING' && (
             <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => transitionStage.mutate('DESIGN_REVIEW')} disabled={transitionStage.isPending}>
                Send for Review <CheckCircle2 size={16} />
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800">
                 <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Palette className="text-primary" size={20} /> Design Studio
                    </CardTitle>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
                        <Upload size={16} /> Upload Final Design
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6 group cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
                    <Upload size={40} className="group-hover:scale-110 transition-transform" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Upload Print-Ready Design</h3>
                 <p className="text-xs text-slate-500 max-w-sm mb-8">Upload your .ai, .psd, or high-res PNG/JPG. This will be shared with the production team after approval.</p>
                 <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start gap-3 text-left max-w-md">
                    <Info size={18} className="text-amber-600 mt-0.5" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400/80 leading-relaxed">Ensure all colors are in CMYK and fonts are outlined before uploading. Multi-color screen prints require separate layers.</p>
                 </div>
              </CardContent>
           </Card>

           <Tabs defaultValue="references" className="w-full">
             <TabsList className="bg-slate-100 dark:bg-slate-900 border dark:border-slate-800">
                <TabsTrigger value="references" className="gap-2"><ImageIcon size={16} /> Client References</TabsTrigger>
                <TabsTrigger value="tickets" className="gap-2"><TicketIcon size={16} /> Communication</TabsTrigger>
             </TabsList>
             <TabsContent value="references" className="mt-4">
                <Card className="border-none shadow-sm p-6 bg-white dark:bg-slate-900">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {order.images?.map((img: any) => (
                        <div key={img.id} className="aspect-square rounded-xl overflow-hidden border dark:border-slate-800 bg-slate-50 relative group cursor-pointer shadow-sm">
                           <img src={img.url} alt="Ref" className="object-cover w-full h-full" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="text-white">View</Button>
                           </div>
                        </div>
                      ))}
                      {(!order.images || order.images.length === 0) && (
                        <div className="col-span-full h-48 flex items-center justify-center text-slate-400 italic text-xs">No reference images provided.</div>
                      )}
                   </div>
                </Card>
             </TabsContent>
             <TabsContent value="tickets" className="mt-4">
                <Card className="border-none shadow-sm p-6 bg-white dark:bg-slate-900">
                   <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-2xl bg-slate-50/50 dark:bg-slate-800/10">
                      <TicketIcon size={48} className="opacity-10 mb-4" />
                      <p className="text-sm font-medium text-slate-500 mb-6">Need clarification from the client?</p>
                      <Button className="gap-2 shadow-lg shadow-primary/20">Raise Approval Ticket</Button>
                   </div>
                </Card>
             </TabsContent>
           </Tabs>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Design Specifications</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Quantity</p>
                       <p className="text-lg font-bold text-primary">{order.quantity}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                       <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Service</p>
                       <p className="text-sm font-bold truncate">{order.service.printType.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Colors</p>
                    <div className="flex flex-wrap gap-2">
                       {order.colors.map((c: string) => (
                         <Badge key={c} variant="secondary" className="px-2 py-0 h-6 text-[10px] font-bold">{c}</Badge>
                       ))}
                    </div>
                 </div>
                 <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3">
                   <Clock className="text-red-500" size={18} />
                   <div className="overflow-hidden">
                      <p className="text-[10px] text-red-700 dark:text-red-400/80 uppercase font-bold">Deadline</p>
                      <p className="text-xs font-bold text-red-600 truncate">{order.expectedDelivery ? format(new Date(order.expectedDelivery), 'PPP') : 'N/A'}</p>
                   </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Designer Checklist</h4>
              <div className="space-y-3">
                 {[
                   'Review reference images',
                   'Clarify print dimensions',
                   'Prepare high-res artboard',
                   'Verify color separation (for Screen)',
                   'Upload final design'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                         {i < 2 && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </div>
                      <span className={cn("text-xs transition-colors", i < 2 ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-300")}>{item}</span>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
