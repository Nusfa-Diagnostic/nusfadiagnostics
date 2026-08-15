import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, IdCard, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ActiveBadge } from "@/components/admin/CrudManager";
import { statusLabel } from "@/components/site/AccountLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/customers")({
  head: () => ({ meta: [{ title: "Customers | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const [code, setCode] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const [profiles, bookings, reports] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("id, customer_id, booking_number, status, payment_status, created_at").order("created_at", { ascending: false }),
        supabase.from("reports").select("id, customer_id, title, is_published, created_at").order("created_at", { ascending: false }),
      ]);
      if (profiles.error) throw profiles.error;
      return (profiles.data ?? []).map(p => ({
        ...p,
        bookingList: (bookings.data ?? []).filter(b => b.customer_id === p.id),
        reportList: (reports.data ?? []).filter(r => r.customer_id === p.id),
      }));
    },
  });

  const codeQuery = code.trim().toUpperCase();
  const rows = (data ?? []).filter(p => {
    if (codeQuery && !(p.customer_code ?? "").toUpperCase().includes(codeQuery)) return false;
    if (!q) return true;
    return `${p.full_name ?? ""} ${p.email ?? ""} ${p.phone ?? ""} ${p.customer_code ?? ""}`.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Look up a patient by Customer ID and review their bookings and reports.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            className="pl-9 font-semibold tracking-wide uppercase"
            placeholder="Customer ID e.g. ND100001"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, email, phone…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">Could not load customers.</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No matching customers.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  {["Customer ID", "Name", "Contact", "Location", "Bookings", "Reports", "Joined", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(p => (
                  <>
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold tabular-nums text-primary whitespace-nowrap">{p.customer_code ?? "—"}</td>
                      <td className="px-4 py-3">{p.full_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div>{p.email ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{p.phone ?? ""}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{[p.city, p.pincode].filter(Boolean).join(" ") || "—"}</td>
                      <td className="px-4 py-3">{p.bookingList.length}</td>
                      <td className="px-4 py-3">{p.reportList.length}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><ActiveBadge active={!!p.is_active} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setOpen(open === p.id ? null : p.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                        >
                          Details <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open === p.id && "rotate-180")} />
                        </button>
                      </td>
                    </tr>
                    {open === p.id && (
                      <tr key={`${p.id}-details`} className="border-t border-border bg-muted/30">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h3 className="font-semibold text-sm mb-2">Bookings & status</h3>
                              {p.bookingList.length ? (
                                <ul className="space-y-1.5 text-xs">
                                  {p.bookingList.map(b => (
                                    <li key={b.id} className="flex flex-wrap justify-between gap-2">
                                      <span className="font-medium">{b.booking_number}</span>
                                      <span className="text-muted-foreground">
                                        {statusLabel(b.status)} · {statusLabel(b.payment_status)} · {new Date(b.created_at).toLocaleDateString()}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-muted-foreground">No bookings yet.</p>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm mb-2">Reports</h3>
                              {p.reportList.length ? (
                                <ul className="space-y-1.5 text-xs">
                                  {p.reportList.map(r => (
                                    <li key={r.id} className="flex flex-wrap justify-between gap-2">
                                      <span className="font-medium">{r.title}</span>
                                      <span className="text-muted-foreground">{r.is_published ? "Published" : "Draft"}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-xs text-muted-foreground">No reports uploaded.</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
