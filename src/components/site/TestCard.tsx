import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, ArrowRight } from "lucide-react";
import type { Test } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function TestCard({ test }: { test: Test }) {
  const { add } = useCart();
  const navigate = useNavigate();

  return (
    <Link
      to="/tests/$slug"
      params={{ slug: test.slug }}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-elegant transition-all hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={test.image}
          alt={test.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-primary">
          {test.category}
        </div>
        {test.mrp && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
            {Math.round(((test.mrp - test.price) / test.mrp) * 100)}% OFF
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {test.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{test.short}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">₹{test.price}</span>
          {test.mrp && <span className="text-sm text-muted-foreground line-through">₹{test.mrp}</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            size="sm"
            className="bg-gradient-primary hover:opacity-95"
            onClick={(e) => { e.preventDefault(); navigate({ to: "/tests/$slug", params: { slug: test.slug } }); }}
          >
            Book Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              add({ id: `test-${test.slug}`, type: "test", name: test.name, price: test.price, image: test.image });
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </Link>
  );
}
