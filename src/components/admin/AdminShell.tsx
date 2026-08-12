import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FlaskConical, Package, Images, Tag, CalendarCheck,
  Users, FileText, Star, HelpCircle, Settings, LogOut, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true as boolean },
  { to: "/admin/tests", label: "Tests", icon: FlaskConical, exact: false as boolean },
  { to: "/admin/packages", label: "Packages", icon: Package, exact: false as boolean },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, exact: false as boolean },
  { to: "/admin/customers", label: "Customers", icon: Users, exact: false as boolean },
  { to: "/admin/reports", label: "Reports", icon: FileText, exact: false as boolean },
  { to: "/admin/content", label: "Website Content", icon: Images, exact: false as boolean },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false as boolean },
] as const;


export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", search: { denied: undefined }, replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="font-display text-lg font-bold text-white leading-tight">NUSFA Admin</div>
        <div className="text-xs text-white/60 mt-0.5 truncate">{user?.email}</div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          View website
        </Link>
        <button onClick={signOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-gradient-hero">{sidebar}</aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-gradient-hero">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4 py-3 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="font-display font-semibold">Admin Panel</div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
