import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, FlaskConical, Facebook, Instagram, Twitter } from "lucide-react";
import { BRAND } from "@/lib/data";

export function Footer() {
  return (
    <footer className="relative mt-20 bg-gradient-to-br from-[oklch(0.18_0.05_250)] to-[oklch(0.25_0.08_250)] text-white">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">NUSFA</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60">Diagnostic</div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Premium diagnostic services with home sample collection, accurate reports and trusted care for West Champaran.
            </p>
            <div className="flex gap-2 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-gradient-primary transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/tests" className="hover:text-white">All Tests</Link></li>
              <li><Link to="/packages" className="hover:text-white">Health Packages</Link></li>
              <li><Link to="/#about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/#contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Top Tests</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/tests/$slug" params={{ slug: "cbc-complete-blood-count" }} className="hover:text-white">CBC</Link></li>
              <li><Link to="/tests/$slug" params={{ slug: "thyroid-profile-total" }} className="hover:text-white">Thyroid Profile</Link></li>
              <li><Link to="/tests/$slug" params={{ slug: "lipid-profile" }} className="hover:text-white">Lipid Profile</Link></li>
              <li><Link to="/tests/$slug" params={{ slug: "vitamin-d-25-oh" }} className="hover:text-white">Vitamin D</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Reach Us</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" /> {BRAND.address}</li>
              {BRAND.phones.map(p => (
                <li key={p} className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" /> <a href={`tel:${p}`} className="hover:text-white">{p}</a></li>
              ))}
              <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" /> <a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-white/50">
          <div>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
          <div>Crafted with care for better healthcare</div>
        </div>
      </div>
    </footer>
  );
}
