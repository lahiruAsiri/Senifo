'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { createTicketSchema, type CreateTicketInput } from '@/schemas/ticket.schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RaiseTicketModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RaiseTicketModal({ orderId, isOpen, onClose }: RaiseTicketModalProps) {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      orderId,
      title: '',
      description: '',
      type: 'DESIGN_APPROVAL',
      priority: 'MEDIUM',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const resp = await api.post('/tickets', data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success('Ticket raised successfully');
      queryClient.invalidateQueries({ queryKey: ['order-tickets', orderId] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to raise ticket');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Raise Approval Ticket</DialogTitle>
          <DialogDescription>
            Need clarification or approval from the client? Raise a ticket and a coordinator will handle it.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Color matching clarification"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message?.toString()}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Ticket Type</Label>
              <Select
                onValueChange={(value: any) => setValue('type', value)}
                defaultValue="DESIGN_APPROVAL"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESIGN_APPROVAL">Design Approval</SelectItem>
                  <SelectItem value="DESIGN_CHANGE">Design Change</SelectItem>
                  <SelectItem value="GENERAL">General Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(value: any) => setValue('priority', value)}
                defaultValue="MEDIUM"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
              placeholder="Provide more details about your request..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message?.toString()}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Raising...
                </>
              ) : (
                'Raise Ticket'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
