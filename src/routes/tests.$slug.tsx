import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Phone, MessageCircle, ShoppingCart, ArrowLeft, Check, Clock, Droplets, FileText, Info } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { TestCard } from "@/components/site/TestCard";
import { Button } from "@/components/ui/button";
import { getTest, relatedTests, BRAND } from "@/lib/data";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/tests/$slug")({
  head: ({ params }) => {
    const t = getTest(params.slug);
    if (!t) return { meta: [{ title: "Test not found" }] };
    return {
      meta: [
        { title: `${t.name} — Book at ₹${t.price} | NUSFA Diagnostic` },
        { name: "description", content: t.short },
        { property: "og:title", content: `${t.name} — NUSFA Diagnostic` },
        { property: "og:description", content: t.short },
        { property: "og:image", content: t.image },
      ],
    };
  },
  loader: ({ params }) => {
    const test = getTest(params.slug);
    if (!test) throw notFound();
    return { test };
  },
  component: TestDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold">Test not found</h1>
        <Link to="/tests" className="text-primary mt-4 inline-block">Browse all tests</Link>
      </div>
    </SiteLayout>
  ),
});

function TestDetail() {
  const { test } = Route.useLoaderData();
  const { add } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const related = relatedTests(test.slug, test.category);

  const addToCart = () => add({ id: `test-${test.slug}`, type: "test", name: test.name, price: test.price, image: test.image });

  return (
    <SiteLayout>
      <section className="relative bg-gradient-hero text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-sm text-white/70 mb-4 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-white">Home</Link> /
            <Link to="/tests" className="hover:text-white">Tests</Link> /
            <span className="text-white">{test.name}</span>
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs font-semibold uppercase tracking-wider mb-4">{test.category}</div>
              <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-4">{test.name}</h1>
              <p className="text-white/85 text-lg max-w-xl">{test.short}</p>
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-4xl font-bold">₹{test.price}</span>
                {test.mrp && <span className="text-white/60 line-through">₹{test.mrp}</span>}
                {test.mrp && <span className="px-2 py-0.5 bg-success rounded-full text-xs font-bold">{Math.round(((test.mrp - test.price) / test.mrp) * 100)}% OFF</span>}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={addToCart}>
                  Book Now
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20" onClick={addToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                <a href={`https://wa.me/${BRAND.whatsapp}?text=I%20want%20to%20book%20${encodeURIComponent(test.name)}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 rounded-lg font-medium" style={{ background: "#25D366", color: "white" }}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={`tel:${BRAND.phones[0]}`} className="inline-flex items-center gap-2 px-5 rounded-lg glass-dark text-white font-medium hover:bg-white/15">
                  <Phone className="h-4 w-4" /> Call
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-elegant">
              <img src={test.image} alt={test.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div className="space-y-10">
            <div>
              <h2 className="font-display font-bold text-2xl mb-3">About this test</h2>
              <p className="text-muted-foreground leading-relaxed">{test.description}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-3">Why this test is required</h2>
              <p className="text-muted-foreground leading-relaxed">{test.why}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-3">Preparation before test</h2>
              <p className="text-muted-foreground leading-relaxed">{test.preparation}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {test.faqs.map((f, i) => (
                  <div key={i} className="glass-card rounded-xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex justify-between items-center text-left">
                      <span className="font-semibold">{f.q}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <div className="px-5 pb-4 text-muted-foreground">{f.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg mb-4">Test details</h3>
              <div className="space-y-4 text-sm">
                {[
                  { icon: Info, label: "Fasting", value: test.fasting },
                  { icon: Droplets, label: "Sample Type", value: test.sampleType },
                  { icon: Clock, label: "Report Time", value: test.reportTime },
                  { icon: FileText, label: "Category", value: test.category },
                ].map((d, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <d.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">{d.label}</div>
                      <div className="font-medium">{d.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 bg-gradient-primary text-primary-foreground">
              <div className="text-sm opacity-90">Best price</div>
              <div className="text-3xl font-bold mb-1">₹{test.price}</div>
              {test.mrp && <div className="text-sm opacity-80 line-through mb-4">MRP ₹{test.mrp}</div>}
              <Button className="w-full bg-white text-primary hover:bg-white/90" onClick={addToCart}>Book Now</Button>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-gradient-soft">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-display">Related tests</h2>
              <Link to="/tests" className="text-primary text-sm font-semibold inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4 rotate-180" /> View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(t => <TestCard key={t.slug} test={t} />)}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
