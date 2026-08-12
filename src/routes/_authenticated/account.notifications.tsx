import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout } from "@/components/site/AccountLayout";

export const Route = createFileRoute("/_authenticated/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | NUSFA Diagnostic" },
      { name: "description", content: "Booking and report update notifications for your NUSFA Diagnostic patient account." },
      { property: "og:title", content: "Notifications | NUSFA Diagnostic" },
      { property: "og:description", content: "Booking and report update notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["account", "notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const unread = (data ?? []).filter(n => !n.is_read).map(n => n.id);
    if (!unread.length) return;
    supabase.from("notifications").update({ is_read: true }).in("id", unread).then(() => {
      qc.invalidateQueries({ queryKey: ["account", "notifications"] });
    });
  }, [data, qc]);

  return (
    <AccountLayout title="Notifications" description="Updates about your bookings and reports.">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load notifications.</p>
      ) : data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map(n => (
            <li key={n.id} className="glass-card rounded-2xl p-5">
              <div className="font-semibold text-sm">{n.title}</div>
              {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{new Date(n.created_at).toLocaleString()}</span>
                {n.link?.startsWith("/account/bookings/") && (
                  <Link
                    to="/account/bookings/$id"
                    params={{ id: n.link.replace("/account/bookings/", "") }}
                    className="text-primary hover:underline"
                  >
                    View booking
                  </Link>
                )}
                {n.link === "/account/reports" && (
                  <Link to="/account/reports" className="text-primary hover:underline">View reports</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      )}
    </AccountLayout>
  );
}
