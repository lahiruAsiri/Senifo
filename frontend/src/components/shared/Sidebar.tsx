'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, Role } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Palette,
  Factory,
  CreditCard,
  Users,
  Settings,
  Calendar,
  Ticket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Super Admin
  { title: 'Overview', href: '/super-admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
  { title: 'Orders', href: '/super-admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN'] },
  { title: 'Users', href: '/super-admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { title: 'Services', href: '/super-admin/services', icon: Layers, roles: ['SUPER_ADMIN'] },
  { title: 'Capacity', href: '/super-admin/capacity', icon: Calendar, roles: ['SUPER_ADMIN'] },

  // Coordinator
  { title: 'Dashboard', href: '/coordinator', icon: LayoutDashboard, roles: ['CLIENT_COORDINATOR'] },
  { title: 'My Orders', href: '/coordinator/orders', icon: ShoppingCart, roles: ['CLIENT_COORDINATOR'] },
  { title: 'Tickets', href: '/coordinator/tickets', icon: Ticket, roles: ['CLIENT_COORDINATOR'] },
  { title: 'Schedule', href: '/coordinator/schedule', icon: Calendar, roles: ['CLIENT_COORDINATOR'] },

  // Designer
  { title: 'Design Feed', href: '/designer', icon: Palette, roles: ['DESIGNER'] },
  { title: 'My Tasks', href: '/designer/tasks', icon: Layers, roles: ['DESIGNER'] },

  // Production
  { title: 'Production Pipe', href: '/production', icon: Factory, roles: ['PRODUCTION'] },
  { title: 'Inventory', href: '/production/inventory', icon: Package, roles: ['PRODUCTION'] },

  // Payment Manager
  { title: 'Payments', href: '/payment', icon: CreditCard, roles: ['PAYMENT_MANAGER'] },
  { title: 'Financial Reports', href: '/payment/reports', icon: BarChart3, roles: ['PAYMENT_MANAGER'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role as Role) : false
  );

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      logout();
      router.push('/login');
    }
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-white dark:bg-slate-900 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight text-primary">SENIFO</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {filteredItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4 space-y-4">
        <div className="flex items-center gap-3">
          <NotificationBell />
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-slate-500 truncate lowercase">{user?.role.replace('_', ' ')}</span>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
            isCollapsed && 'px-2'
          )}
          onClick={handleLogout}
        >
          <LogOut size={20} className={cn(!isCollapsed && 'mr-2')} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
