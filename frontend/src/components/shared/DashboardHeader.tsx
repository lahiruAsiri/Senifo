'use client';

import { Search, Bell, Menu, Languages } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="h-20 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="Search..." 
          className="pl-10 bg-slate-100/50 dark:bg-slate-800/50 border-none focus-visible:ring-emerald-500 rounded-xl"
        />
      </div>

      {/* Mobile Menu Icon */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </Button>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-slate-500">
           <Languages size={20} />
        </Button>
        
        <ThemeToggle />
        <NotificationBell />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
               <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/20">
                  {getInitials(user?.name || '')}
               </div>
               <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold leading-none">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
               </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 shadow-2xl border-none bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
            <DropdownMenuLabel className="px-3 py-2">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer">Security</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer text-destructive focus:bg-destructive/10">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
