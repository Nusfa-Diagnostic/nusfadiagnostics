import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PackageCard } from "@/components/site/PackageCard";
import { Input } from "@/components/ui/input";
import { packages } from "@/lib/data";

export const Route = createFileRoute("/packages/")({
  head: () => ({
    meta: [
      { title: "All Health Packages — NUSFA Diagnostic" },
      { name: "description", content: "Affordable health checkup packages — full body, diabetes, women wellness, senior care. Free home sample collection." },
      { property: "og:title", content: "All Health Packages — NUSFA Diagnostic" },
      { property: "og:description", content: "Browse curated health packages with great savings." },
    ],
  }),
  component: PackagesList,
});

function PackagesList() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => packages.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.short.toLowerCase().includes(q.toLowerCase())
  ), [q]);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-sm text-white/70 mb-3">Home / All Packages</div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">Health Packages</h1>
          <p className="text-white/85 max-w-2xl">Smart bundles for full-body wellness — designed to save you time, money and effort.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="glass-card rounded-2xl p-4 md:p-5 mb-8 -mt-20 relative shadow-elegant">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search packages…" className="pl-11 h-12 bg-background border-border" />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No packages match your search.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(p => <PackageCard key={p.slug} pkg={p} />)}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
