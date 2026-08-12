import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, CalendarCheck, FileText, UserCog, LogOut, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/Layout";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/account/bookings", label: "My Bookings", icon: CalendarCheck, exact: false },
  { to: "/account/reports", label: "My Reports", icon: FileText, exact: false },
  { to: "/account/notifications", label: "Notifications", icon: Bell, exact: false },
  { to: "/account/profile", label: "Profile", icon: UserCog, exact: false },
] as const;

export function AccountLayout({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: s => s.location.pathname });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
          <p className="text-white/80 mt-2 text-sm">{description ?? user?.email}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 h-fit">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {NAV.map(item => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                      active ? "bg-gradient-primary text-primary-foreground shadow-md" : "text-foreground/75 hover:bg-secondary",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" /> {item.label}
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </SiteLayout>
  );
}

export const BOOKING_STEPS = [
  "new",
  "confirmed",
  "sample_collected",
  "processing",
  "report_ready",
  "completed",
] as const;

export function statusLabel(s: string | null | undefined) {
  return String(s ?? "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = String(status ?? "");
  const tone =
    s === "cancelled" ? "bg-destructive/10 text-destructive"
      : s === "completed" || s === "report_ready" ? "bg-success/10 text-success"
      : "bg-primary/10 text-primary";
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>{statusLabel(s)}</span>;
}
