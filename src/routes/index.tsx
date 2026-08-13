import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Clock, HomeIcon, Microscope, ShieldCheck, Star, Truck, Users, ChevronDown, MapPin, Phone, Mail, Send, Calendar, FlaskConical, FileText, Stethoscope } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SectionHeader } from "@/components/site/SectionHeader";
import { TestCard } from "@/components/site/TestCard";
import { PackageCard } from "@/components/site/PackageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/lib/data";
import { useTests, usePackages, useOffers, useTestimonials, useFaqs } from "@/lib/content";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUSFA Diagnostic — Pathology Lab in Ramnagar." },
      { name: "description", content: "Book lab tests & health packages online with free home sample collection. NABL-quality reports, transparent pricing, trusted by families in West Champaran." },
      { property: "og:title", content: "NUSFA Diagnostic — Pathology Lab in Ramnagar." },
      { property: "og:description", content: "Book lab tests & health packages online with free home sample collection. NABL-quality reports, transparent pricing, trusted by families in West Champaran." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <HeroSlider />
      <FeaturedTests />
      <FeaturedPackages />
      <WhyChoose />
      <HowItWorks />
      <Offers />
      <Testimonials />
      <FAQ />
      <Contact />
      <Map />
    </SiteLayout>
  );
}

function FeaturedTests() {
  const { tests } = useTests();
  const featured = tests.filter(t => t.featured).slice(0, 4);
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">Featured Tests</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight">Most booked diagnostic tests</h2>
            <p className="mt-3 text-muted-foreground">Accurate, affordable, and ready when you need them.</p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-end">
            <Link to="/tests">See All Tests <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(t => <TestCard key={t.slug} test={t} />)}
        </div>
      </div>
    </section>
  );
}

function FeaturedPackages() {
  const { packages } = usePackages();
  const featured = packages.filter(p => p.featured).slice(0, 4);
  return (
    <section className="py-20 md:py-24 bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">Health Packages</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight">Smart packages, big savings</h2>
            <p className="mt-3 text-muted-foreground">Curated panels that cover what matters most.</p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-end">
            <Link to="/packages">See All Packages <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map(p => <PackageCard key={p.slug} pkg={p} />)}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Award, title: "NABL-Quality Standards", desc: "Strict QC across every reagent, machine and report." },
  { icon: HomeIcon, title: "Free Home Collection", desc: "Trained phlebotomists at your doorstep, on time." },
  { icon: Clock, title: "Fast Digital Reports", desc: "Reports on WhatsApp & Email — most within 24 hours." },
  { icon: ShieldCheck, title: "100% Safe & Sterile", desc: "Single-use needles, sealed vials, full hygiene." },
  { icon: Microscope, title: "Advanced Equipment", desc: "Fully automated analyzers for highest accuracy." },
  { icon: Users, title: "Expert Pathologists", desc: "Reviewed and signed by qualified specialists." },
];

function WhyChoose() {
  return (
    <section id="about" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Why NUSFA"
          title="Diagnostics you can truly trust"
          description="Built on accuracy, comfort and care — so every report you receive helps you make better health decisions."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="group glass-card rounded-2xl p-6 hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: FlaskConical, title: "Choose Your Test", desc: "Browse 200+ tests & curated packages." },
  { icon: Calendar, title: "Sample Collection", desc: "Pick a slot — free home collection." },
  { icon: Stethoscope, title: "Lab Processing", desc: "Tested on advanced auto-analyzers." },
  { icon: FileText, title: "Download Report", desc: "Get accurate digital reports on WhatsApp." },
];

function HowItWorks() {
  return (
    <section className="py-20 md:py-24 bg-gradient-soft relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-glow)" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="How It Works" title="Four simple steps to your report" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="relative glass-card rounded-2xl p-7 text-center hover:shadow-elegant transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm shadow-glow">
                {i + 1}
              </div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4 mt-2">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const staticOffers = [
  { tag: "New Patient", title: "20% OFF on first booking", desc: "Use code NUSFA20 on your first test or package.", color: "from-[oklch(0.52_0.18_248)] to-[oklch(0.68_0.16_235)]" },
  { tag: "Family Plan", title: "Full Body for ₹1499", desc: "75+ parameters with free home collection.", color: "from-[oklch(0.55_0.18_220)] to-[oklch(0.72_0.16_200)]" },
  { tag: "Senior Care", title: "Free doctor consultation", desc: "On every senior citizen care package.", color: "from-[oklch(0.5_0.2_260)] to-[oklch(0.65_0.18_240)]" },
];

function Offers() {
  const offers = useOffers(staticOffers.map(o => ({ tag: o.tag, title: o.title, desc: o.desc })));
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Latest Offers" title="Savings designed for your family" />
        <div className="grid gap-6 md:grid-cols-3">
          {offers.map((o, i) => (
            <div key={i} className={`relative rounded-3xl p-8 text-white overflow-hidden bg-gradient-to-br ${staticOffers[i % staticOffers.length]!.color} shadow-elegant hover:scale-[1.02] transition-transform`}>
              <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="inline-flex px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-4">{o.tag}</div>
                <h3 className="font-display font-bold text-2xl mb-2 leading-tight">{o.title}</h3>
                <p className="text-white/85 text-sm mb-5">{o.desc}</p>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/tests">Book Now <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const staticReviews = [
  { name: "Anjali Singh", role: "Ramnagar", text: "Excellent service! The phlebotomist arrived on time and reports came on WhatsApp within hours. Highly recommended." },
  { name: "Md. Imran", role: "Bagaha", text: "Very professional staff. The full body checkup package saved us a lot, and the doctor consultation was helpful." },
  { name: "Sunita Devi", role: "West Champaran", text: "I trust NUSFA for all my family's tests. Affordable, accurate and the team is very polite." },
];

function Testimonials() {
  const reviews = useTestimonials(staticReviews.map(r => ({ ...r, rating: 5 })));
  return (
    <section className="py-20 md:py-24 bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Testimonials" title="Loved by families across West Champaran" />
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="glass-card rounded-2xl p-7 hover:shadow-elegant transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground/85 leading-relaxed mb-5">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const staticFaqs = [
  { q: "Do you offer home sample collection?", a: "Yes — free home sample collection is available across Ramnagar and nearby areas of West Champaran. Just book online or call us." },
  { q: "How quickly do I receive my reports?", a: "Most reports are delivered the same day or within 24 hours, sent to you on WhatsApp and email." },
  { q: "Are the tests reliable?", a: "Absolutely. All tests are conducted with NABL-quality controls, calibrated analyzers and reviewed by qualified pathologists." },
  { q: "What payment methods are accepted?", a: "We accept cash, UPI, debit/credit cards and online payments at the time of sample collection." },
  { q: "Do you provide doctor consultation?", a: "Yes — free consultation is included with most of our health packages." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = useFaqs(staticFaqs);
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" />
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left">
                <span className="font-display font-semibold">{f.q}</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed animate-fade-up">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-20 md:py-24 bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Contact" title="Reach out, anytime" description="Have a question? Need a custom package? Our team is just a message away." />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              { icon: MapPin, label: "Address", value: BRAND.address },
              { icon: Phone, label: "Phone", value: BRAND.phones.join("  •  ") },
              { icon: Mail, label: "Email", value: BRAND.email },
              { icon: Truck, label: "Service Area", value: "Ramnagar, Bagaha & all of West Champaran" },
            ].map((c, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="font-medium text-foreground mt-0.5">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); toast.success("Thanks! We'll get back to you shortly."); (e.target as HTMLFormElement).reset(); }}
            className="glass-card rounded-2xl p-6 md:p-8 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" placeholder="Your name" required />
              <Input name="phone" type="tel" placeholder="Phone number" required />
            </div>
            <Input name="email" type="email" placeholder="Email (optional)" />
            <Textarea name="message" placeholder="Tell us how we can help" rows={5} required />
            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-95">
              Send Message <Send className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Map() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl overflow-hidden shadow-elegant border border-border/60">
          <iframe
            src={BRAND.mapEmbed}
            className="w-full h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="NUSFA Diagnostic location"
          />
        </div>
      </div>
    </section>
  );
}
