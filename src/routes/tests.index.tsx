import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { TestCard } from "@/components/site/TestCard";
import { Input } from "@/components/ui/input";
import { tests, categories } from "@/lib/data";

export const Route = createFileRoute("/tests/")({
  head: () => ({
    meta: [
      { title: "All Diagnostic Tests — NUSFA Diagnostic" },
      { name: "description", content: "Browse all diagnostic tests offered by NUSFA. Search by name or category and book online with free home sample collection." },
      { property: "og:title", content: "All Diagnostic Tests — NUSFA Diagnostic" },
      { property: "og:description", content: "Search and book lab tests with free home sample collection." },
    ],
  }),
  component: TestsList,
});

function TestsList() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => tests.filter(t => {
    const matchesQ = !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.short.toLowerCase().includes(q.toLowerCase());
    const matchesC = cat === "All" || t.category === cat;
    return matchesQ && matchesC;
  }), [q, cat]);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-sm text-white/70 mb-3">Home / All Tests</div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">All Diagnostic Tests</h1>
          <p className="text-white/85 max-w-2xl">Find the right test in seconds. Transparent pricing, free home collection, fast reports.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="glass-card rounded-2xl p-4 md:p-5 mb-8 -mt-20 relative shadow-elegant">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search tests by name…"
                  className="pl-11 h-12 bg-background border-border"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", ...categories].map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`px-4 h-12 rounded-lg text-sm font-medium transition-all ${
                      cat === c ? "bg-gradient-primary text-primary-foreground shadow-md" : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No tests match your search.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(t => <TestCard key={t.slug} test={t} />)}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
