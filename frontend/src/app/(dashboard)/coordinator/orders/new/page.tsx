'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Check, UserPlus, Search, ShoppingBag, Palette, ImageIcon, FileText, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Client', icon: UserPlus },
  { id: 2, title: 'Order', icon: ShoppingBag },
  { id: 3, title: 'Specs', icon: Palette },
  { id: 4, title: 'Images', icon: ImageIcon },
  { id: 5, title: 'Review', icon: FileText },
];

export default function NewOrderWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    clientId: '',
    serviceId: '',
    quantity: 1,
    tshirtType: 'Crew Neck Cotton',
    colors: ['White'],
    sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    expectedDelivery: '',
    images: [],
    pricingTierId: '',
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (await api.get('/clients')).data.data,
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data.data,
  });

  const createOrder = useMutation({
    mutationFn: async (data: any) => (await api.post('/orders', data)).data,
    onSuccess: (res) => {
      toast.success(`Order ${res.data.orderNumber} created successfully!`);
      router.push(`/coordinator/orders/${res.data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create order');
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && !formData.clientId) return toast.error('Please select a client');
    if (currentStep === 2 && (!formData.serviceId || !formData.quantity)) return toast.error('Please fill order details');
    if (currentStep < 5) setCurrentStep(currentStep + 1);
    else {
      // Final calculation and formatting
      const selectedService = services?.find((s: any) => s.id === formData.serviceId);
      const tier = selectedService?.pricingTiers?.find((t: any) => 
        formData.quantity >= t.minQuantity && (!t.maxQuantity || formData.quantity <= t.maxQuantity)
      ) || selectedService?.pricingTiers?.[0];

      const unitPrice = tier?.pricePerUnit || 0;
      const delivery = tier?.deliveryCostFlat || 0;
      const totalAmount = (formData.quantity * unitPrice) + delivery;

      const payload = {
        ...formData,
        unitPrice,
        totalAmount,
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined,
      };

      createOrder.mutate(payload);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSizeChange = (size: string, qty: number) => {
    setFormData((prev: any) => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: qty },
      quantity: Object.values({ ...prev.sizes, [size]: qty }).reduce((a: any, b: any) => Number(a) + Number(b), 0)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Order</h1>
          <p className="text-slate-500 text-sm">Create a new printing order in 5 easy steps.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex justify-between relative px-2">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 mx-8" />
        {STEPS.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              currentStep === step.id ? "bg-primary border-primary text-primary-foreground shadow-lg scale-110" : 
              currentStep > step.id ? "bg-emerald-500 border-emerald-500 text-white" : 
              "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            )}>
              {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider transition-colors",
              currentStep === step.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b dark:border-slate-800">
          <CardTitle className="text-xl flex items-center gap-2">
            Step {currentStep}: {STEPS[currentStep-1].title} Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={18} />
                  </span>
                  <Select
                    value={formData.clientId}
                    onValueChange={(v) => updateFormData('clientId', v)}
                  >
                    <SelectTrigger className="pl-10 h-12 bg-slate-50/50 dark:bg-slate-800/10">
                      <SelectValue placeholder="Search or select a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>{client.name} ({client.company || 'Individual'})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-dashed text-center flex flex-col items-center gap-4 bg-slate-50/30 dark:bg-slate-800/5">
                <p className="text-sm text-slate-500">Client not listed? Create a new one first.</p>
                <Button variant="outline" size="sm" asChild className="gap-2">
                   <Link href="/coordinator/clients/new"><UserPlus size={16} /> Add New Client</Link>
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Print Service</Label>
                  <Select value={formData.serviceId} onValueChange={(v) => updateFormData('serviceId', v)}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Select service..." /></SelectTrigger>
                    <SelectContent>
                      {services?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.printType.replace('_', ' ')})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>T-Shirt Type</Label>
                  <Input 
                    value={formData.tshirtType} 
                    onChange={(e) => updateFormData('tshirtType', e.target.value)}
                    className="h-12"
                    placeholder="e.g. Crew Neck Cotton, Polo 220gsm"
                  />
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <div>
                   <p className="text-xs text-slate-500">Selected Service:</p>
                   <p className="text-sm font-bold">{services?.find((s: any) => s.id === formData.serviceId)?.name || 'None'}</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="space-y-4">
                  <Label>Size Quantities (Total: {formData.quantity})</Label>
                  <div className="grid grid-cols-5 gap-4">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <div key={size} className="space-y-2">
                        <Label className="text-[10px] text-center block uppercase text-slate-400">{size}</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          className="text-center h-12 bg-slate-50 dark:bg-slate-800"
                          value={formData.sizes[size]}
                          onChange={(e) => handleSizeChange(size, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
               </div>
               <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label>Preferred Color(s)</Label>
                    <Input 
                      placeholder="e.g. Navy Blue, White" 
                      className="h-12"
                      value={formData.colors.join(', ')}
                      onChange={(e) => updateFormData('colors', e.target.value.split(',').map(s => s.trim()))}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Expected Delivery Date</Label>
                    <Input 
                      type="date" 
                      className="h-12"
                      value={formData.expectedDelivery}
                      onChange={(e) => updateFormData('expectedDelivery', e.target.value)}
                    />
                 </div>
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 bg-slate-50/50 dark:bg-slate-800/10">
                  <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 animate-bounce">
                    <ImageIcon size={32} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload Reference Images</h3>
                  <p className="text-xs text-slate-500 mb-6 text-center max-w-xs">Drag and drop images or designs. Files will be uploaded to MinIO securely. (Max 5MB per file)</p>
                  <Button variant="outline" className="gap-2 px-8 shadow-sm">
                    <Plus size={16} /> Choose Files
                  </Button>
               </div>
               <p className="text-[10px] text-center text-slate-400">Images are linked to this order for designers and production.</p>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">Client Details</h4>
                    <p className="text-sm font-semibold">{clients?.find((c: any) => c.id === formData.clientId)?.name}</p>
                    <p className="text-xs text-slate-500">{clients?.find((c: any) => c.id === formData.clientId)?.company || 'Individual'}</p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">Order Specs</h4>
                    <p className="text-sm font-semibold">{services?.find((s: any) => s.id === formData.serviceId)?.name} × {formData.quantity} Total</p>
                    <p className="text-xs text-slate-500">{formData.tshirtType} in {formData.colors.join(', ')}</p>
                 </div>
              </div>
              <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <h5 className="font-bold text-emerald-900 dark:text-emerald-400">Ready to Submit!</h5>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500/80">Review all details before finalizing. Order will start in `PENDING` state.</p>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-slate-50/50 dark:bg-slate-800/20 border-t dark:border-slate-800 p-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || createOrder.isPending}
            className="px-8"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={createOrder.isPending}
            className="px-10 gap-2 shadow-lg shadow-primary/20"
          >
            {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {currentStep === 5 ? 'Finalize & Create Order' : 'Next Step'}
            {currentStep < 5 && <ArrowRight size={18} />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
