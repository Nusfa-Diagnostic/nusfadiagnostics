import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useHeroSlides } from "@/lib/content";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

export interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
}

const staticSlides: Slide[] = [
  {
    image: hero1,
    title: "Precision Diagnostics. Trusted Care.",
    subtitle: "NABL-quality lab in Ramnagar",
    description: "Advanced testing, accurate reports, and a team that truly cares — for every family in West Champaran.",
    cta: "Explore All Tests",
    ctaLink: "/tests",
  },
  {
    image: hero2,
    title: "Home Sample Collection — Absolutely Free",
    subtitle: "Comfort meets accuracy",
    description: "Our trained phlebotomists collect samples at your doorstep with complete safety and zero extra cost.",
    cta: "Book a Test",
    ctaLink: "/tests",
  },
  {
    image: hero3,
    title: "Health Packages from ₹799",
    subtitle: "75+ parameters in one go",
    description: "Curated full-body & specialty packages that detect early, so you can stay healthy longer.",
    cta: "View Packages",
    ctaLink: "/packages",
  },
];

export function HeroSlider() {
  const slides = useHeroSlides(staticSlides);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    onSelect();
    const id = setInterval(() => embla.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [embla, onSelect]);

  return (
    <section className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%] h-[88vh] min-h-[560px] max-h-[820px]">
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 h-full w-full object-cover"
                {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.06_250/0.85)] via-[oklch(0.25_0.08_250/0.55)] to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.15_0.06_250/0.6)] to-transparent" />

              <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl text-white">
                  <div key={selected === i ? `a-${i}` : `b-${i}`} className="animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-sm font-medium mb-6">
                      <ShieldCheck className="h-4 w-4 text-primary-glow" />
                      {s.subtitle}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-[1.05] mb-5">
                      {s.title}
                    </h1>
                    <p className="text-base md:text-lg text-white/85 mb-8 max-w-xl leading-relaxed">
                      {s.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={s.ctaLink}
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-primary font-semibold shadow-glow hover:opacity-95 transition-opacity"
                      >
                        {s.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/packages"
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass-dark text-white font-semibold hover:bg-white/15 transition-colors"
                      >
                        View Packages
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* arrows */}
      <button
        aria-label="Previous"
        onClick={() => embla?.scrollPrev()}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass-dark text-white hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next"
        onClick={() => embla?.scrollNext()}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass-dark text-white hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={`h-2 rounded-full transition-all ${
              selected === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
