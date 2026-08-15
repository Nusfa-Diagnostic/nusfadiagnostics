import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CalendarCheck, FileText, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout, StatusBadge } from "@/components/site/AccountLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useMyProfile, firstName } from "@/lib/profile";


export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({
    meta: [
      { title: "My Account | NUSFA Diagnostic" },
      { name: "description", content: "View your lab bookings, collection status and download your NUSFA Diagnostic reports in one place." },
      { property: "og:title", content: "My Account | NUSFA Diagnostic" },
      { property: "og:description", content: "Track bookings and download your lab reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountHome,
});

function AccountHome() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const greeting = firstName(profile?.full_name, user?.email);


  const { data, isLoading, error } = useQuery({
    queryKey: ["account", "overview", user?.id],
    queryFn: async () => {
      const [bookings, reports] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      if (bookings.error) throw bookings.error;
      if (reports.error) throw reports.error;
      return { bookings: bookings.data ?? [], reports: reports.data ?? [] };
    },
    enabled: !!user,
  });

  const active = data?.bookings.find(b => b.status !== "completed" && b.status !== "cancelled");

  return (
    <AccountLayout title={`Welcome back, ${greeting}`} description="Your bookings, collection status and reports at a glance.">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load your account data.</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Total bookings</div>
              <div className="font-display text-3xl font-bold mt-1">{data?.bookings.length ?? 0}</div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Reports available</div>
              <div className="font-display text-3xl font-bold mt-1">{data?.reports.length ?? 0}</div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Current status</div>
              <div className="mt-2">{active ? <StatusBadge status={active.status} /> : <span className="text-sm text-muted-foreground">No active booking</span>}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-primary"><Link to="/tests">Book a test</Link></Button>
            <Button asChild variant="outline"><Link to="/packages">View packages</Link></Button>
            <Button asChild variant="outline"><Link to="/cart">Go to cart</Link></Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" /> Recent bookings
                </h2>
                <Link to="/account/bookings" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {data?.bookings.length ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {data.bookings.map(b => (
                    <li key={b.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                      <Link to="/account/bookings/$id" params={{ id: b.id }} className="hover:text-primary">{b.booking_number}</Link>
                      <StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No bookings yet. <Link to="/tests" className="text-primary hover:underline">Browse tests</Link>.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Latest reports
                </h2>
                <Link to="/account/reports" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {data?.reports.length ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {data.reports.map(r => (
                    <li key={r.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                      <span>{r.title ?? "Report"}</span>
                      <span className="text-muted-foreground">{r.is_published ? "Ready" : "Processing"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Your reports will appear here once published.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
