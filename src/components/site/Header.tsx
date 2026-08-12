import { Link, useNavigate } from "@tanstack/react-router";
import { Phone, ShoppingCart, Menu, X, FlaskConical, User } from "lucide-react";
import { useRef, useState } from "react";
import { BRAND } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tests", label: "Tests" },
  { to: "/packages", label: "Packages" },
  { to: "/#about", label: "About" },
  { to: "/#contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const taps = useRef<number[]>([]);

  const handleLogoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter(t => now - t < 4000), now];
    if (taps.current.length >= 7) {
      taps.current = [];
      navigate({ to: "/admin/login", search: { denied: undefined } });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={handleLogoTap}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base text-foreground">NUSFA</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Diagnostic</div>
            </div>
          </Link>


          <nav className="hidden lg:flex items-center gap-1">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${BRAND.phones[0]}`}
              aria-label={`Home Collection ${BRAND.phones[0]}`}
              className="flex items-center gap-2 rounded-lg border border-primary bg-background px-2.5 py-1.5 text-primary shadow-sm transition-colors hover:bg-primary/5"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap text-[13px] font-medium leading-none">
                <span className="hidden sm:inline">Home Collection </span>
                <span className="font-semibold">{BRAND.phones[0]}</span>
              </span>
            </a>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground shadow-md">
                  {count}
                </span>
              )}
            </Link>
            <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-primary hover:opacity-95 shadow-md">
              <Link to="/tests">Book Test</Link>
            </Button>
            <button onClick={() => setOpen(o => !o)} className="lg:hidden grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 animate-fade-up">
            <nav className="flex flex-col gap-1">
              {nav.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-foreground/80 hover:bg-secondary hover:text-primary font-medium">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
