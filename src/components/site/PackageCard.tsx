import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Check, ArrowRight } from "lucide-react";
import type { Package } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function PackageCard({ pkg }: { pkg: Package }) {
  const { add } = useCart();
  const navigate = useNavigate();

  return (
    <Link
      to="/packages/$slug"
      params={{ slug: pkg.slug }}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-elegant transition-all hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img src={pkg.image} alt={pkg.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
          Save {Math.round(((pkg.mrp - pkg.price) / pkg.mrp) * 100)}%
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">{pkg.includes.length} Tests Included</div>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">{pkg.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{pkg.short}</p>
        <ul className="space-y-1 flex-1">
          {pkg.includes.slice(0, 3).map(t => (
            <li key={t} className="flex items-center gap-2 text-xs text-foreground/80">
              <Check className="h-3.5 w-3.5 text-success shrink-0" /> {t}
            </li>
          ))}
          {pkg.includes.length > 3 && (
            <li className="text-xs font-medium text-primary">+{pkg.includes.length - 3} more</li>
          )}
        </ul>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-bold">₹{pkg.price}</span>
          <span className="text-sm text-muted-foreground line-through">₹{pkg.mrp}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="bg-gradient-primary hover:opacity-95"
            onClick={(e) => { e.preventDefault(); navigate({ to: "/packages/$slug", params: { slug: pkg.slug } }); }}>
            Book Package <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <Button size="sm" variant="outline"
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              add({ id: `pkg-${pkg.slug}`, type: "package", name: pkg.name, price: pkg.price, image: pkg.image });
            }}>
            <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
