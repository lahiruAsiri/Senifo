'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Layers, Plus, Pencil, Trash2, TrendingUp, DollarSign, Settings2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ServiceManagement() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['super-admin-services'],
    queryFn: async () => (await api.get('/services')).data.data,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services & Pricing</h1>
          <p className="text-slate-500 text-sm">Configure printing methods, actual costs, and client pricing tiers.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
           <Plus size={18} /> Define New Service
        </Button>
      </div>

      <div className="grid gap-6">
         {services?.map((service: any) => (
           <Card key={service.id} className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <Layers size={24} />
                    </div>
                    <div>
                       <CardTitle className="text-lg">{service.name}</CardTitle>
                       <CardDescription className="text-xs uppercase font-bold tracking-widest">{service.printType.replace('_', ' ')}</CardDescription>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:bg-primary/5">
                       <Pencil size={14} /> Edit Service
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="grid grid-cols-1 md:grid-cols-4 border-b dark:border-slate-800">
                    <div className="p-6 border-r dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Internal Actual Cost</p>
                       <p className="text-xl font-black text-rose-500">LKR {Number(service.pricingTiers[0]?.actualCostPerUnit).toLocaleString()}</p>
                       <p className="text-[9px] text-slate-500 mt-1 italic">Per unit base cost</p>
                    </div>
                    <div className="p-6 border-r dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Min. Order</p>
                       <p className="text-xl font-black text-slate-900 dark:text-slate-100">12 Pcs</p>
                    </div>
                    <div className="p-6 border-r dark:border-slate-800">
                       <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Avg. Margin</p>
                       <p className="text-xl font-black text-emerald-500">~65%</p>
                    </div>
                    <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20">
                       <div className="flex items-center gap-2 mb-2">
                          <Settings2 size={14} className="text-slate-400" />
                          <p className="text-[10px] text-slate-400 font-bold uppercase">System Status</p>
                       </div>
                       <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-50/50">ENABLED</Badge>
                    </div>
                 </div>
                 <div className="p-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">Client Pricing Tiers</p>
                    <Table>
                       <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow>
                             <TableHead>Tier Name</TableHead>
                             <TableHead>Unit Price (Client)</TableHead>
                             <TableHead>Markup</TableHead>
                             <TableHead>Qty Breakdown</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {service.pricingTiers.map((tier: any) => (
                             <TableRow key={tier.id}>
                               <TableCell className="font-bold text-xs">
                                  {tier.minQuantity}{tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'} Units
                               </TableCell>
                               <TableCell className="text-xs font-black text-primary">LKR {Number(tier.pricePerUnit).toLocaleString()}</TableCell>
                               <TableCell className="text-xs text-emerald-600 font-bold">
                                  +{Math.round(((Number(tier.pricePerUnit) - Number(tier.actualCostPerUnit))/Number(tier.actualCostPerUnit))*100)}%
                               </TableCell>
                               <TableCell className="text-[10px] text-slate-500">Linear / Wholesaler</TableCell>
                               <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil size={12} /></Button>
                               </TableCell>
                            </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
      
      <Card className="border-none shadow-sm bg-slate-900 text-white p-6 overflow-hidden relative">
         <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse" />
         <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-primary">
               <Info size={24} />
            </div>
            <div>
               <h4 className="text-lg font-bold">System Pricing Advice</h4>
               <p className="text-xs text-slate-400 max-w-lg">Actual costs should be reviewed monthly based on raw material supply (Fabrics, Inks). Margins below 30% trigger alerts for Super Admins.</p>
            </div>
         </div>
      </Card>
    </div>
  );
}
