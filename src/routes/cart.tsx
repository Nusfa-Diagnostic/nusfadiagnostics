import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { BRAND } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — NUSFA Diagnostic" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, remove, clear, total } = useCart();
  const { user, loading } = useAuth();

  const waMessage = encodeURIComponent(
    "Hi NUSFA Diagnostic, I want to book the following:\n\n" +
      items.map(i => `• ${i.name} — ₹${i.price}`).join("\n") +
      `\n\nTotal: ₹${total}`
  );

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-3xl md:text-4xl font-bold font-display">Your Cart</h1>
          <p className="text-white/80 mt-2">Review your items and confirm booking on WhatsApp.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary mb-5">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Browse tests or packages to get started.</p>
              <div className="flex justify-center gap-3">
                <Button asChild className="bg-gradient-primary"><Link to="/tests">Browse Tests</Link></Button>
                <Button asChild variant="outline"><Link to="/packages">Browse Packages</Link></Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
              <div className="space-y-3">
                {items.map(i => (
                  <div key={i.id} className="glass-card rounded-2xl p-4 flex gap-4 items-center">
                    <img src={i.image} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{i.type}</div>
                      <div className="font-display font-semibold">{i.name}</div>
                      <div className="text-lg font-bold mt-1">₹{i.price}</div>
                    </div>
                    <button onClick={() => remove(i.id)} className="grid h-10 w-10 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
              </div>
              <aside className="glass-card rounded-2xl p-6 h-fit lg:sticky lg:top-24">
                <h3 className="font-display font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between"><span>Items</span><span>{items.length}</span></div>
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div>
                  <div className="flex justify-between"><span>Home collection</span><span className="text-success">Free</span></div>
                </div>
                <div className="flex justify-between font-bold text-lg mb-5">
                  <span>Total</span><span>₹{total}</span>
                </div>
                {loading ? (
                  <Button disabled className="w-full bg-gradient-primary">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
                  </Button>
                ) : user ? (
                  <Button asChild className="w-full bg-gradient-primary">
                    <Link to="/checkout">Proceed to Booking <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="w-full bg-gradient-primary">
                      <Link to="/auth" search={{ redirect: "/checkout" }}>
                        Login to Book <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Sign in or create a free account to confirm and track your booking.
                    </p>
                  </>
                )}
                <a href={`https://wa.me/${BRAND.whatsapp}?text=${waMessage}`} target="_blank" rel="noreferrer"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold text-white" style={{ background: "#25D366" }}>
                  <MessageCircle className="h-4 w-4" /> Book on WhatsApp
                </a>
                <a href={`tel:${BRAND.phones[0]}`}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-lg font-semibold border border-border">
                  Call to Book <ArrowRight className="h-4 w-4" />
                </a>
              </aside>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
