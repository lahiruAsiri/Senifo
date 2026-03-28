'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, BellOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read');
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <Bell size={20} className="text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <DropdownMenuLabel className="p-4 bg-slate-50/50 dark:bg-slate-800/10 border-b dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Notifications</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{unreadCount} New</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {(notifications || []).length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <BellOff className="mx-auto mb-2 opacity-20" size={32} />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            (notifications || []).map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer",
                  !n.isRead && "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
                )}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs text-slate-900 dark:text-slate-100">{n.title}</span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p>
                {!n.isRead && (
                   <div className="flex justify-end mt-2">
                     <Check size={14} className="text-primary opacity-50" />
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
