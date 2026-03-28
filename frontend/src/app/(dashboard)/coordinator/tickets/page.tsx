'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Ticket, Search, Plus, Filter, MessageSquare, Clock, AlertCircle, ShoppingCart, User, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CoordinatorTickets() {
  const [status, setStatus] = useState('OPEN');
  
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['coordinator-tickets', status],
    queryFn: async () => (await api.get(`/tickets?status=${status}`)).data.data,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 text-sm">Review design approvals and resolve communication issues.</p>
        </div>
        <div className="flex gap-2">
           <Button variant={status === 'OPEN' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('OPEN')}>Open</Button>
           <Button variant={status === 'RESOLVED' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('RESOLVED')}>Resolved</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets?.map((ticket: any) => (
          <Link key={ticket.id} href={`/coordinator/tickets/${ticket.id}`} className="group">
            <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all border-l-4 group-hover:border-l-primary" style={{ borderLeftColor: ticket.priority === 'HIGH' ? '#f43f5e' : undefined }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tighter">
                    {ticket.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{format(new Date(ticket.createdAt), 'MMM d')}</span>
                </div>
                <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">{ticket.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{ticket.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                   <div className="flex items-center gap-2">
                      <ShoppingCart size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold">{ticket.order.orderNumber}</span>
                   </div>
                   <Badge variant="outline" className="text-[10px] lowercase">{ticket.status.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                   <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>By: {ticket.raisedBy.name}</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{ticket.comments?.length || 0} comments</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
        {(!tickets || tickets.length === 0) && !isLoading && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border-2 border-dashed rounded-2xl">
            <CheckCircle2 size={48} className="text-emerald-500 opacity-20 mb-4" />
            <p className="text-slate-500 font-medium tracking-tight">No {status.toLowerCase()} tickets found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
