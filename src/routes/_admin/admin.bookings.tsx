import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminBookings,
});

const STATUSES = ["new", "confirmed", "sample_collected", "processing", "report_ready", "completed", "cancelled"] as const;
const PAYMENTS = ["pending", "paid", "refunded", "failed"] as const;
const label = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

function AdminBookings() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_items(item_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, string> }) => {
      const { error } = await supabase.from("bookings").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter(b => {
    if (filter !== "all" && b.status !== filter) return false;
    if (!q) return true;
    const hay = `${b.booking_number} ${b.contact_name ?? ""} ${b.contact_phone ?? ""} ${b.city ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and progress every customer booking.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search booking, name, phone…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">Could not load bookings.</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No bookings match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  {["Booking", "Customer", "Items", "Collection", "Amount", "Payment", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(b => (
                  <tr key={b.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{b.booking_number}</div>
                      <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.contact_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{b.contact_phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px]">
                      {(b.booking_items ?? []).map(i => i.item_name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Badge variant="secondary">{label(b.collection_type)}</Badge>
                      <div className="text-muted-foreground mt-1">{b.scheduled_date ?? "—"} {b.scheduled_time ?? ""}</div>
                      {b.address && <div className="text-muted-foreground">{b.address}, {b.city} {b.pincode}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">₹{b.amount}</td>
                    <td className="px-4 py-3">
                      <Select value={b.payment_status} onValueChange={v => update.mutate({ id: b.id, patch: { payment_status: v } })}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENTS.map(s => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={b.status} onValueChange={v => update.mutate({ id: b.id, patch: { status: v } })}>
                        <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
