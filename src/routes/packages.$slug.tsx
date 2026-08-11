import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Phone, MessageCircle, ShoppingCart, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { PackageCard } from "@/components/site/PackageCard";
import { Button } from "@/components/ui/button";
import { getPackage, relatedPackages, BRAND, type Package } from "@/lib/data";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/packages/$slug")({
  head: ({ params }) => {
    const p = getPackage(params.slug);
    if (!p) return { meta: [{ title: "Package not found" }] };
    return {
      meta: [
        { title: `${p.name} at ₹${p.price} | NUSFA Diagnostic` },
        { name: "description", content: p.short },
        { property: "og:title", content: `${p.name} — NUSFA Diagnostic` },
        { property: "og:description", content: p.short },
        { property: "og:image", content: p.image },
      ],
    };
  },
  loader: ({ params }): { pkg: Package } => {
    const pkg = getPackage(params.slug);
    if (!pkg) throw notFound();
    return { pkg };
  },
  component: PackageDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold">Package not found</h1>
        <Link to="/packages" className="text-primary mt-4 inline-block">Browse all packages</Link>
      </div>
    </SiteLayout>
  ),
});

function PackageDetail() {
  const { pkg } = Route.useLoaderData();
  const { add } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const related = relatedPackages(pkg.slug);
  const addToCart = () => add({ id: `pkg-${pkg.slug}`, type: "package", name: pkg.name, price: pkg.price, image: pkg.image });
  const discount = Math.round(((pkg.mrp - pkg.price) / pkg.mrp) * 100);

  return (
    <SiteLayout>
      <section className="relative bg-gradient-hero text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-sm text-white/70 mb-4 flex gap-2 flex-wrap">
            <Link to="/" className="hover:text-white">Home</Link> /
            <Link to="/packages" className="hover:text-white">Packages</Link> /
            <span className="text-white">{pkg.name}</span>
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs font-semibold uppercase tracking-wider mb-4">{pkg.includes.length} Tests Included</div>
              <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-4">{pkg.name}</h1>
              <p className="text-white/85 text-lg max-w-xl">{pkg.short}</p>
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-4xl font-bold">₹{pkg.price}</span>
                <span className="text-white/60 line-through">₹{pkg.mrp}</span>
                <span className="px-2 py-0.5 bg-success rounded-full text-xs font-bold">{discount}% OFF</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" onClick={addToCart}>Book Package</Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20" onClick={addToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
                <a href={`https://wa.me/${BRAND.whatsapp}?text=I%20want%20to%20book%20${encodeURIComponent(pkg.name)}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 rounded-lg font-medium" style={{ background: "#25D366", color: "white" }}>
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={`tel:${BRAND.phones[0]}`} className="inline-flex items-center gap-2 px-5 rounded-lg glass-dark text-white font-medium hover:bg-white/15">
                  <Phone className="h-4 w-4" /> Call
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-elegant">
              <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div className="space-y-10">
            <div>
              <h2 className="font-display font-bold text-2xl mb-4">Included tests ({pkg.includes.length})</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pkg.includes.map((t: string) => (
                  <div key={t} className="glass-card rounded-xl p-4 flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-3">Benefits</h2>
              <ul className="space-y-2">
                {pkg.benefits.map((b: string) => (
                  <li key={b} className="flex gap-2 text-muted-foreground"><Check className="h-5 w-5 text-success shrink-0" /> {b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-3">Preparation</h2>
              <p className="text-muted-foreground leading-relaxed">{pkg.preparation}</p>
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl mb-4">FAQs</h2>
              <div className="space-y-3">
                {pkg.faqs.map((f: {q:string;a:string}, i: number) => (
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
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="glass-card rounded-2xl p-6 bg-gradient-primary text-primary-foreground">
              <div className="text-sm opacity-90">Package Price</div>
              <div className="text-4xl font-bold">₹{pkg.price}</div>
              <div className="text-sm opacity-80 line-through">MRP ₹{pkg.mrp}</div>
              <div className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">You save ₹{pkg.mrp - pkg.price} ({discount}%)</div>
              <Button className="w-full mt-5 bg-white text-primary hover:bg-white/90" onClick={addToCart}>Book Package</Button>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-16 bg-gradient-soft">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-8">Related packages</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(p => <PackageCard key={p.slug} pkg={p} />)}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
