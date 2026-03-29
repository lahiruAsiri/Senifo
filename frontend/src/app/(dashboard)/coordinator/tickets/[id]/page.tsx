'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Clock, 
  AlertCircle,
  User,
  ShoppingCart,
  CheckCircle2,
  MoreVertical,
  CircleDot
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function TicketDetail() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => (await api.get(`/tickets/${id}`)).data.data,
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => (await api.post(`/tickets/${id}/comments`, { content })).data,
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      toast.success('Comment added');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => (await api.put(`/tickets/${id}/status`, { status })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      toast.success('Ticket status updated');
    },
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center animate-pulse text-slate-400">Loading ticket details...</div>;
  if (!ticket) return <div className="p-12 text-center">Ticket not found</div>;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment.mutate(comment);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
             <Badge variant={ticket.priority === 'HIGH' ? 'destructive' : 'secondary'}>
               {ticket.priority} Priority
             </Badge>
          </div>
          <p className="text-xs text-slate-500">Raised by {ticket.raisedBy.name} • {format(new Date(ticket.createdAt), 'PPpp')}</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
             {ticket.status.replace('_', ' ')}
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details and Comments */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Issue Description</CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ticket.description}</p>
                 <div className="mt-6 pt-6 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] items-center text-slate-400 font-bold uppercase mb-1 flex gap-1">
                         <CircleDot size={10} /> Ticket Category
                       </p>
                       <p className="text-sm font-medium">{ticket.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <p className="text-[10px] items-center text-slate-400 font-bold uppercase mb-1 flex gap-1">
                          <Clock size={10} /> Last Activity
                        </p>
                        <p className="text-sm font-medium">
                          {ticket.comments?.length > 0 
                            ? format(new Date(ticket.comments[ticket.comments.length - 1].createdAt), 'MMM d, p')
                            : 'No activity yet'}
                        </p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <MessageSquare size={20} className="text-primary" /> 
                 Conversation
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {ticket.comments?.map((c: any) => (
                  <div key={c.id} className={cn(
                    "p-4 rounded-2xl max-w-[85%] border shadow-sm",
                    c.user.id === ticket.raisedBy.id 
                      ? "bg-slate-50 dark:bg-slate-800/40 mr-auto border-slate-100" 
                      : "bg-primary/5 dark:bg-primary/10 ml-auto border-primary/20"
                  )}>
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-bold uppercase text-primary/70">{c.user.name}</span>
                       <span className="text-[10px] text-slate-400">{format(new Date(c.createdAt), 'p')}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{c.content}</p>
                  </div>
                ))}
                {(!ticket.comments || ticket.comments.length === 0) && (
                  <div className="text-center py-12 text-slate-400 italic text-sm border-2 border-dashed rounded-2xl">
                    No comments yet. Start the conversation below.
                  </div>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="relative mt-4">
                <Input
                  className="pr-20 py-6 rounded-2xl bg-white dark:bg-slate-900 border-primary/20 focus-visible:ring-primary"
                  placeholder="Type your message here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-2 top-2 rounded-xl"
                  disabled={addComment.isPending || !comment.trim()}
                >
                  <Send size={16} className="mr-2" /> Send
                </Button>
              </form>
           </div>
        </div>

        {/* Right Column: Order Context and Actions */}
        <div className="space-y-6">
           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Context</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                    <div className="bg-primary/10 p-2 rounded-lg">
                       <ShoppingCart className="text-primary" size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Order Number</p>
                       <p className="text-sm font-bold">{ticket.order.orderNumber}</p>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-400 font-medium">Order Status</span>
                       <Badge variant="outline" className="text-[10px] tracking-widest">{ticket.order.status}</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-400 font-medium">Service Type</span>
                       <span className="font-bold">{ticket.order.service?.printType || 'N/A'}</span>
                    </div>
                 </div>

                 <Button 
                   variant="outline" 
                   className="w-full text-xs font-bold gap-2"
                   onClick={() => router.push(`/coordinator/orders/${ticket.order.id}`)}
                 >
                   View Full Order Details
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b dark:border-slate-800">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Manage Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-2">Update the ticket status to let the requester know the current progress.</p>
                 
                 <Button 
                   className="w-full justify-start gap-3 bg-amber-500 hover:bg-amber-600 text-white border-none"
                   onClick={() => updateStatus.mutate('AWAITING_CLIENT')}
                   disabled={ticket.status === 'AWAITING_CLIENT' || updateStatus.isPending}
                 >
                   <Clock size={16} /> Awaiting Client Response
                 </Button>

                 <Button 
                   className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                   onClick={() => updateStatus.mutate('RESOLVED')}
                   disabled={ticket.status === 'RESOLVED' || updateStatus.isPending}
                 >
                   <CheckCircle2 size={16} /> Mark as Resolved
                 </Button>

                 <Button 
                   variant="ghost"
                   className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                   onClick={() => updateStatus.mutate('CLOSED')}
                   disabled={ticket.status === 'CLOSED' || updateStatus.isPending}
                 >
                   <AlertCircle size={16} /> Close Ticket Permanently
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
