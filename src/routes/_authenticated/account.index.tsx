import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

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
  const { user, signOut } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["account", "overview", user?.id],
    queryFn: async () => {
      const [bookings, reports] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      return { bookings: bookings.data ?? [], reports: reports.data ?? [] };
    },
    enabled: !!user,
  });

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground mt-1 text-sm">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
        </div>

        {isLoading ? (
          <Loader2 className="mt-10 h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Recent bookings</h2>
              {data?.bookings.length ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {data.bookings.map(b => (
                    <li key={b.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                      <span>{b.item_name ?? "Booking"}</span>
                      <span className="text-muted-foreground capitalize">{String(b.status ?? "").replace(/_/g, " ")}</span>
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
              <h2 className="font-display text-lg font-semibold">My reports</h2>
              {data?.reports.length ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {data.reports.map(r => (
                    <li key={r.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                      <span>{r.title ?? "Report"}</span>
                      <span className="text-muted-foreground capitalize">{String(r.status ?? "")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Your reports will appear here once published.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
