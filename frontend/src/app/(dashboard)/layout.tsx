'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/shared/Sidebar';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          // Attempt to get user info to verify session
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

  // Basic role-based access control for routes
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
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
