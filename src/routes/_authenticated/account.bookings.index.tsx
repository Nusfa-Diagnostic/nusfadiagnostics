import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout, StatusBadge, statusLabel } from "@/components/site/AccountLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account/bookings/")({
  head: () => ({
    meta: [
      { title: "My Bookings | NUSFA Diagnostic" },
      { name: "description", content: "Track every NUSFA Diagnostic lab booking, collection slot and current test status in your patient account." },
      { property: "og:title", content: "My Bookings | NUSFA Diagnostic" },
      { property: "og:description", content: "Track your lab bookings and collection status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["account", "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AccountLayout title="My Bookings" description="All your lab bookings and their live status.">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load your bookings. Please refresh.</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map(b => (
            <div key={b.id} className="glass-card rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold">{b.booking_number}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {(b.booking_items ?? []).map(i => i.item_name).join(", ") || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusLabel(b.collection_type)} · {b.scheduled_date ?? "Date to be confirmed"} {b.scheduled_time ?? ""} · ₹{b.amount}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/account/bookings/$id" params={{ id: b.id }}>
                  View details <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground text-sm">You have no bookings yet.</p>
          <Button asChild className="mt-4 bg-gradient-primary"><Link to="/tests">Browse tests</Link></Button>
        </div>
      )}
    </AccountLayout>
  );
}
