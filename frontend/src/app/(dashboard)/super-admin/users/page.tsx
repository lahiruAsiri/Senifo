'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Users, UserPlus, Shield, Mail, Key, Trash2, Edit, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function UserManagement() {
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => (await api.get('/users')).data.data,
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => 
      (await api.put(`/users/${id}/status`, { isActive: !active })).data,
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
    },
  });

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { label: string, color: string }> = {
      SUPER_ADMIN: { label: 'Admin', color: 'bg-rose-500 text-white' },
      CLIENT_COORDINATOR: { label: 'Coordinator', color: 'bg-primary text-white' },
      DESIGNER: { label: 'Designer', color: 'bg-blue-500 text-white' },
      PRODUCTION: { label: 'Production', color: 'bg-orange-500 text-white' },
      PAYMENT_MANAGER: { label: 'Finance', color: 'bg-emerald-500 text-white' },
    };
    const config = configs[role] || { label: role, color: 'bg-slate-500 text-white' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm">Manage internal staff roles and system access.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20">
           <UserPlus size={18} /> Add New Staff
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Email & Contact</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold">
                          {user.name.charAt(0)}
                       </div>
                       <span className="font-bold text-sm">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-slate-500">
                       <div className="flex items-center gap-1.5"><Mail size={12} /> {user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'outline' : 'destructive'} className={user.isActive ? 'text-emerald-500 border-emerald-500' : ''}>
                       {user.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <Edit size={16} />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className={user.isActive ? 'h-8 w-8 text-rose-500' : 'h-8 w-8 text-emerald-500'}
                         onClick={() => toggleStatus.mutate({ id: user.id, active: user.isActive })}
                       >
                          {user.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 animate-pulse bg-slate-50/50 dark:bg-slate-800/10" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
         <Card className="border-none shadow-sm bg-primary text-white p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-white/10 h-24 w-24 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <Shield size={24} className="mb-4 opacity-50" />
            <h4 className="text-xl font-bold mb-1">RBAC Controls</h4>
            <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Enterprise Level</p>
         </Card>
         <Card className="border-none shadow-sm bg-slate-900 text-white p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-white/10 h-24 w-24 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <Key size={24} className="mb-4 opacity-50" />
            <h4 className="text-xl font-bold mb-1">Audit Logging</h4>
            <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Track Action</p>
         </Card>
         <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-6 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h5 className="text-xs font-bold uppercase text-slate-400">Security Note</h5>
                  <p className="text-xs text-slate-500 mt-1">Passwords are hashed via Argon2id. Multi-factor auth implementation pending.</p>
               </div>
               <AlertCircle size={20} className="text-amber-500" />
            </div>
         </Card>
      </div>
    </div>
  );
}
