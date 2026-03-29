'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, Role } from '@/store/authStore';
import Sidebar from '@/components/shared/Sidebar';
import DashboardHeader from '@/components/shared/DashboardHeader';
import MobileNav from '@/components/shared/MobileNav'; // I'll create this next
import { Loader2, LayoutDashboard, ShoppingCart, Users, Layers, Calendar, Ticket, Palette, Factory, Package, CreditCard, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const navItems = [
  { title: 'Overview', href: '/super-admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN'] },
  { title: 'Orders', href: '/super-admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN'] },
  { title: 'Customers', href: '/super-admin/users', icon: Users, roles: ['SUPER_ADMIN'] },
  { title: 'Services', href: '/super-admin/services', icon: Layers, roles: ['SUPER_ADMIN'] },
  { title: 'Capacity', href: '/super-admin/capacity', icon: Calendar, roles: ['SUPER_ADMIN'] },
  { title: 'Dashboard', href: '/coordinator', icon: LayoutDashboard, roles: ['CLIENT_COORDINATOR'] },
  { title: 'My Orders', href: '/coordinator/orders', icon: ShoppingCart, roles: ['CLIENT_COORDINATOR'] },
  { title: 'Tickets', href: '/coordinator/tickets', icon: Ticket, roles: ['CLIENT_COORDINATOR'], badge: '02' },
  { title: 'Schedule', href: '/coordinator/schedule', icon: Calendar, roles: ['CLIENT_COORDINATOR'] },
  { title: 'Design Feed', href: '/designer', icon: Palette, roles: ['DESIGNER'] },
  { title: 'My Tasks', href: '/designer/tasks', icon: Layers, roles: ['DESIGNER'] },
  { title: 'Production Pipe', href: '/production', icon: Factory, roles: ['PRODUCTION'] },
  { title: 'Inventory', href: '/production/inventory', icon: Package, roles: ['PRODUCTION'] },
  { title: 'Payments', href: '/payment', icon: CreditCard, roles: ['PAYMENT_MANAGER'] },
  { title: 'Financial Reports', href: '/payment/reports', icon: BarChart3, roles: ['PAYMENT_MANAGER'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          const response = await api.get('/auth/me');
          setAuth(response.data.data);
        } catch (error) {
          toast.error('Session expired. Please log in.');
          router.push('/login');
          return;
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, router, setAuth]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthorized = () => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (pathname.startsWith('/coordinator') && user.role !== 'CLIENT_COORDINATOR') return false;
    if (pathname.startsWith('/designer') && user.role !== 'DESIGNER') return false;
    if (pathname.startsWith('/production') && user.role !== 'PRODUCTION') return false;
    if (pathname.startsWith('/payment') && user.role !== 'PAYMENT_MANAGER') return false;
    if (pathname.startsWith('/super-admin')) return false;
    return true;
  };

  if (!isAuthorized()) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <p className="text-xl text-slate-600">You are not authorized to view this page.</p>
        <button onClick={() => router.back()} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  const filteredItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role as Role) : false
  );

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      router.push('/login');
    } catch (error) {
      logout();
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Mobile Nav Overlay */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
        items={filteredItems}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setIsMobileNavOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
