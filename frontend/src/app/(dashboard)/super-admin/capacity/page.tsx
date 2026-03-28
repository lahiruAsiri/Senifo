'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Calendar, Plus, Save, Info, AlertCircle, CheckCircle2, Factory, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, startOfYear, addMonths } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CapacityManagement() {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [capacityValue, setCapacityValue] = useState(5000);

  const { data: capacity, isLoading } = useQuery({
    queryKey: ['super-admin-capacity', selectedYear],
    queryFn: async () => (await api.get(`/capacity?year=${selectedYear}`)).data.data,
  });

  const updateCapacity = useMutation({
    mutationFn: async () => (await api.post('/capacity', { 
      month: selectedMonth, 
      year: selectedYear, 
      totalCapacity: capacityValue 
    })).data,
    onSuccess: () => {
      toast.success('Capacity updated for ' + format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy'));
      queryClient.invalidateQueries({ queryKey: ['super-admin-capacity'] });
    },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    num: i + 1,
    name: format(new Date(selectedYear, i), 'MMM'),
    fullName: format(new Date(selectedYear, i), 'MMMM'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capacity Control</h1>
          <p className="text-slate-500 text-sm">Managed monthly printing bandwidth and system availability.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="border-b dark:border-slate-800 flex flex-row items-center justify-between">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="text-primary" size={20} /> {selectedYear} Capacity Grid
                 </CardTitle>
                 <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {[2024, 2025].map(y => (
                      <Button 
                        key={y} 
                        variant={selectedYear === y ? 'default' : 'ghost'} 
                        size="sm" 
                        className="h-7 text-[10px] font-bold"
                        onClick={() => setSelectedYear(y)}
                      >
                         {y}
                      </Button>
                    ))}
                 </div>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {months.map((m) => {
                       const cap = capacity?.find((c: any) => c.month === m.num);
                       const isSelected = selectedMonth === m.num;
                       return (
                         <div 
                           key={m.num} 
                           className={cn(
                             "relative p-4 rounded-xl border-2 transition-all cursor-pointer text-center group",
                             isSelected ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/10"
                           )}
                           onClick={() => {
                             setSelectedMonth(m.num);
                             if (cap) setCapacityValue(cap.totalCapacity);
                           }}
                         >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{m.name}</span>
                            <div className="mt-2 text-base font-black">
                               {cap ? (cap.totalCapacity / 1000).toFixed(1) + 'k' : '—'}
                            </div>
                            {cap && (
                               <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 overflow-hidden rounded-b-xl">
                                  <div className="h-full bg-primary" style={{ width: `${(cap.usedCapacity / cap.totalCapacity) * 100}%` }} />
                               </div>
                            )}
                         </div>
                       );
                    })}
                 </div>
              </CardContent>
           </Card>
        </div>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900 border-t-4 border-t-primary overflow-hidden">
           <CardHeader className="bg-primary/5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Configure Month</CardTitle>
              <CardDescription className="text-[10px] font-bold">{months.find(m => m.num === selectedMonth)?.fullName} {selectedYear}</CardDescription>
           </CardHeader>
           <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase text-slate-400">Total Monthly Capacity (Pcs)</Label>
                 <Input 
                   type="number" 
                   className="h-12 text-xl font-black border-2 border-primary/20" 
                   value={capacityValue}
                   onChange={(e) => setCapacityValue(parseInt(e.target.value) || 0)}
                 />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Booked Capacity:</span>
                    <span className="font-bold">1,240 pcs</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Utilization Rate:</span>
                    <span className="font-bold text-emerald-500">24.8%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '24.8%' }} />
                 </div>
              </div>
              <Button 
                className="w-full h-12 gap-2 font-bold shadow-lg shadow-primary/20"
                onClick={() => updateCapacity.mutate()}
                disabled={updateCapacity.isPending}
              >
                 {updateCapacity.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                 Update Configuration
              </Button>
           </CardContent>
           <CardFooter className="bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-600 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-500/80 leading-relaxed">Increasing capacity here doesn't affect actual physical machinery. It only allows the system to book more orders for this month.</p>
           </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-800 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <Factory size={20} />
            </div>
            <div>
               <p className="text-xs font-bold">Base Fleet Capacity</p>
               <p className="text-[10px] text-slate-500">8,500 pcs / month total</p>
            </div>
         </div>
      </div>
    </div>
  );
}
