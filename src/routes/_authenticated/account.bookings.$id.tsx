import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout, BOOKING_STEPS, StatusBadge, statusLabel } from "@/components/site/AccountLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking Details | NUSFA Diagnostic" },
      { name: "description", content: "See your NUSFA Diagnostic booking details, collection address, payment status and the full sample-to-report status timeline." },
      { property: "og:title", content: "Booking Details | NUSFA Diagnostic" },
      { property: "og:description", content: "Booking details and live status timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["account", "booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const currentIndex = data ? BOOKING_STEPS.indexOf(data.status as (typeof BOOKING_STEPS)[number]) : -1;
  const cancelled = data?.status === "cancelled";

  return (
    <AccountLayout title="Booking Details" description={data?.booking_number ?? "Loading…"}>
      <Link to="/account/bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load this booking.</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Booking not found.</p>
      ) : (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-xl font-bold">{data.booking_number}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {new Date(data.created_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={data.status} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-5">Status timeline</h2>
            {cancelled ? (
              <p className="text-sm text-destructive">This booking was cancelled.</p>
            ) : (
              <ol className="space-y-4">
                {BOOKING_STEPS.map((step, i) => {
                  const done = i <= currentIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs",
                        done ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground",
                      )}>
                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className={cn("text-sm", done ? "font-medium" : "text-muted-foreground")}>
                        {statusLabel(step)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display font-semibold mb-3">Items</h2>
              <ul className="space-y-2 text-sm">
                {(data.booking_items ?? []).map(i => (
                  <li key={i.id} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                    <span>{i.item_name}</span><span>₹{i.price}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold mt-4"><span>Total</span><span>₹{data.amount}</span></div>
              <p className="text-xs text-muted-foreground mt-2">Payment: {statusLabel(data.payment_status)}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-sm space-y-1.5">
              <h2 className="font-display font-semibold mb-3">Collection</h2>
              <p>{statusLabel(data.collection_type)}</p>
              <p className="text-muted-foreground">{data.scheduled_date ?? "Date to be confirmed"} {data.scheduled_time ?? ""}</p>
              {data.address && <p className="text-muted-foreground">{data.address}, {data.city} {data.pincode}</p>}
              <p className="text-muted-foreground">{data.contact_name} · {data.contact_phone}</p>
              {data.customer_notes && <p className="text-muted-foreground pt-2">Notes: {data.customer_notes}</p>}
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
