'use client';

import { X, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  user: any;
  onLogout: () => void;
}

export default function MobileNav({ isOpen, onClose, items, user, onLogout }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex md:hidden transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className={cn(
        "relative w-4/5 max-w-sm h-full bg-sidebar text-sidebar-foreground shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center relative mb-8">
          <img src="/logo.png" alt="Senifo Logo" className="h-8 w-auto" />
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-0 text-sidebar-foreground/60 hover:text-white hover:bg-white/10">
            <X size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
           <nav className="grid gap-2">
             {items.map((item, index) => (
               <Link
                 key={index}
                 href={item.href}
                 onClick={onClose}
                 className={cn(
                   'flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
                   pathname === item.href
                     ? 'bg-white/10 text-white shadow-sm'
                     : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-white'
                 )}
               >
                 <item.icon 
                   size={22} 
                   className={cn(
                     "transition-colors", 
                     pathname === item.href ? "text-emerald-400" : "text-sidebar-foreground/40"
                   )} 
                 />
                 <span>{item.title}</span>
                 {item.badge && (
                   <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-emerald-500/20">
                     {item.badge}
                   </span>
                 )}
               </Link>
             ))}
           </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-sidebar-border/20">
          <div className="flex items-center gap-3 mb-6 px-2">
             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
             </div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{user?.name}</span>
                <span className="text-xs text-sidebar-foreground/40 truncate capitalize">{user?.role.toLowerCase().replace('_', ' ')}</span>
             </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-white hover:bg-white/5 rounded-xl px-4 h-12 transition-all"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
