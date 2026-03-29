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
  badge?: string;
}

const generalItems: NavItem[] = [
  // Super Admin
  { title: 'Overview', href: '/super-admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
  { title: 'Orders', href: '/super-admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN'] },
  { title: 'Customers', href: '/super-admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { title: 'Services', href: '/super-admin/services', icon: Layers, roles: ['SUPER_ADMIN'] },
  { title: 'Capacity', href: '/super-admin/capacity', icon: Calendar, roles: ['SUPER_ADMIN'] },

  // Coordinator
  { title: 'Dashboard', href: '/coordinator', icon: LayoutDashboard, roles: ['CLIENT_COORDINATOR'] },
  { title: 'My Orders', href: '/coordinator/orders', icon: ShoppingCart, roles: ['CLIENT_COORDINATOR'] },
  { title: 'Tickets', href: '/coordinator/tickets', icon: Ticket, roles: ['CLIENT_COORDINATOR'], badge: '02' },
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

const accountItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'CLIENT_COORDINATOR', 'DESIGNER', 'PRODUCTION', 'PAYMENT_MANAGER'] },
  { title: 'Help', href: '/help', icon: Users, roles: ['SUPER_ADMIN', 'CLIENT_COORDINATOR', 'DESIGNER', 'PRODUCTION', 'PAYMENT_MANAGER'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => (user ? item.roles.includes(user.role as Role) : false));

  const filteredGeneral = filterItems(generalItems);
  const filteredAccount = filterItems(accountItems);

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
        'relative hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex h-20 items-center  relative px-6 border-sidebar-border/50">
        {!isCollapsed && (
          <img src="/logo.png" alt="Senifo Logo" className="h-10 w-auto" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-sidebar-foreground/60 hover:text-white hover:bg-white/10",
            !isCollapsed ? "absolute right-4" : "mx-auto"
          )}
        >
          <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-6">
        {/* General Items */}
        <div className="space-y-4">
          {!isCollapsed && (
            <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
              General
            </h3>
          )}
          <nav className="grid gap-1">
            {filteredGeneral.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={20} className={cn("transition-colors", pathname === item.href ? "text-emerald-400" : "group-hover:text-emerald-400")} />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-emerald-500 text-white font-bold py-0.5 px-2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Account Items */}
        <div className="space-y-4">
          {!isCollapsed && (
            <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
              Account
            </h3>
          )}
          <nav className="grid gap-1">
            {filteredAccount.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon size={20} className={cn("transition-colors", pathname === item.href ? "text-emerald-400" : "group-hover:text-emerald-400")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-auto border-sidebar-border/20 p-6 space-y-6">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-sidebar-foreground/60 hover:text-white hover:bg-white/5 rounded-xl transition-all',
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
