import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | NUSFA Diagnostic" },
      { name: "description", content: "Overview of tests, packages, bookings, customers and reports for NUSFA Diagnostic." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Dashboard | NUSFA Diagnostic" },
      { property: "og:description", content: "Overview of bookings, customers and reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const COUNTS = [
  { table: "tests", label: "Tests" },
  { table: "packages", label: "Packages" },
  { table: "bookings", label: "Bookings" },
  { table: "profiles", label: "Customers" },
  { table: "reports", label: "Reports" },
] as const;

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const out: Record<string, number> = {};
      for (const c of COUNTS) {
        const { count } = await supabase.from(c.table as never).select("*", { count: "exact", head: true });
        out[c.table] = count ?? 0;
      }
      return out;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {COUNTS.map(c => (
            <div key={c.table} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <div className="mt-2 font-display text-3xl font-bold">{data?.[c.table] ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
