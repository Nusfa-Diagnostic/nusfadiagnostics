import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ActiveBadge } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_admin/admin/customers")({
  head: () => ({ meta: [{ title: "Customers | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const [profiles, bookings, reports] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("customer_id"),
        supabase.from("reports").select("customer_id"),
      ]);
      if (profiles.error) throw profiles.error;
      const count = (rows: { customer_id: string }[] | null, id: string) =>
        (rows ?? []).filter(r => r.customer_id === id).length;
      return (profiles.data ?? []).map(p => ({
        ...p,
        bookings: count(bookings.data, p.id),
        reports: count(reports.data, p.id),
      }));
    },
  });

  const rows = (data ?? []).filter(p =>
    !q ? true : `${p.full_name ?? ""} ${p.email ?? ""} ${p.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Registered patients with their booking and report history.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name, email, phone…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">Could not load customers.</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  {["Name", "Contact", "Location", "Bookings", "Reports", "Joined", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3">{p.full_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div>{p.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{[p.city, p.pincode].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-3">{p.bookings}</td>
                    <td className="px-4 py-3">{p.reports}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><ActiveBadge active={!!p.is_active} /></td>
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
