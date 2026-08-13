import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  tests as staticTests,
  packages as staticPackages,
  categories as staticCategories,
  type Package,
  type Test,
  type TestFAQ,
} from "@/lib/data";

function faqList(value: unknown): TestFAQ[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map(f => ({ q: String(f["q"] ?? f["question"] ?? ""), a: String(f["a"] ?? f["answer"] ?? "") }))
    .filter(f => f.q && f.a);
}

function fallbackImage(slug: string, kind: "test" | "package") {
  const source = kind === "test" ? staticTests : staticPackages;
  return source.find(s => s.slug === slug)?.image ?? (source[0]?.image as string);
}

type TestRow = {
  slug: string; name: string; price: number | string; mrp: number | string | null;
  image_url: string | null; short_description: string | null; description: string | null;
  why_required: string | null; preparation: string | null; fasting_required: string | null;
  sample_type: string | null; report_time: string | null; is_featured: boolean; faqs: unknown;
  test_categories?: { name: string } | null;
};

type PackageRow = {
  slug: string; name: string; price: number | string; mrp: number | string | null;
  image_url: string | null; short_description: string | null; includes: string[] | null;
  benefits: string[] | null; preparation: string | null; is_featured: boolean; faqs: unknown;
};

function mapTest(r: TestRow): Test {
  const fb = staticTests.find(t => t.slug === r.slug);
  return {
    slug: r.slug,
    name: r.name,
    category: r.test_categories?.name ?? fb?.category ?? "General",
    price: Number(r.price),
    ...(r.mrp != null ? { mrp: Number(r.mrp) } : fb?.mrp != null ? { mrp: fb.mrp } : {}),
    image: r.image_url || fallbackImage(r.slug, "test"),
    short: r.short_description ?? fb?.short ?? "",
    description: r.description ?? fb?.description ?? "",
    why: r.why_required ?? fb?.why ?? "",
    preparation: r.preparation ?? fb?.preparation ?? "",
    fasting: r.fasting_required ?? fb?.fasting ?? "Not required",
    sampleType: r.sample_type ?? fb?.sampleType ?? "Blood",
    reportTime: r.report_time ?? fb?.reportTime ?? "Within 24 hours",
    featured: r.is_featured,
    faqs: faqList(r.faqs).length ? faqList(r.faqs) : (fb?.faqs ?? []),
  };
}

function mapPackage(r: PackageRow): Package {
  const fb = staticPackages.find(p => p.slug === r.slug);
  return {
    slug: r.slug,
    name: r.name,
    price: Number(r.price),
    mrp: Number(r.mrp ?? fb?.mrp ?? r.price),
    image: r.image_url || fallbackImage(r.slug, "package"),
    short: r.short_description ?? fb?.short ?? "",
    includes: r.includes?.length ? r.includes : (fb?.includes ?? []),
    benefits: r.benefits?.length ? r.benefits : (fb?.benefits ?? []),
    preparation: r.preparation ?? fb?.preparation ?? "",
    featured: r.is_featured,
    faqs: faqList(r.faqs).length ? faqList(r.faqs) : (fb?.faqs ?? []),
  };
}

const TEST_SELECT =
  "slug, name, price, mrp, image_url, short_description, description, why_required, preparation, fasting_required, sample_type, report_time, is_featured, faqs, sort_order, test_categories(name)";
const PACKAGE_SELECT =
  "slug, name, price, mrp, image_url, short_description, includes, benefits, preparation, is_featured, faqs, sort_order";

/** Live tests from the admin-managed database, falling back to bundled content. */
export function useTests() {
  const query = useQuery({
    queryKey: ["public", "tests"],
    staleTime: 60_000,
    queryFn: async (): Promise<Test[]> => {
      const { data, error } = await supabase
        .from("tests")
        .select(TEST_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(r => mapTest(r as unknown as TestRow));
    },
  });
  const tests = query.data && query.data.length > 0 ? query.data : staticTests;
  return { tests, isLoading: query.isLoading };
}

export function usePackages() {
  const query = useQuery({
    queryKey: ["public", "packages"],
    staleTime: 60_000,
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase
        .from("packages")
        .select(PACKAGE_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(r => mapPackage(r as unknown as PackageRow));
    },
  });
  const packages = query.data && query.data.length > 0 ? query.data : staticPackages;
  return { packages, isLoading: query.isLoading };
}

export function useTestCategories(tests: Test[]) {
  const query = useQuery({
    queryKey: ["public", "test-categories"],
    staleTime: 60_000,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("test_categories")
        .select("name, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(c => c.name);
    },
  });
  if (query.data && query.data.length) return query.data;
  const derived = Array.from(new Set(tests.map(t => t.category)));
  return derived.length ? derived : staticCategories;
}

/** Single test by slug; returns the bundled version until the live row arrives. */
export function useTest(slug: string, fallback: Test) {
  const { tests } = useTests();
  return tests.find(t => t.slug === slug) ?? fallback;
}

export function usePackageBySlug(slug: string, fallback: Package) {
  const { packages } = usePackages();
  return packages.find(p => p.slug === slug) ?? fallback;
}

export type OfferItem = { tag: string; title: string; desc: string };
export type ReviewItem = { name: string; role: string; text: string; rating: number };
export type FaqItem = { q: string; a: string };

export function useOffers(fallback: OfferItem[]) {
  const query = useQuery({
    queryKey: ["public", "offers"],
    staleTime: 60_000,
    queryFn: async (): Promise<OfferItem[]> => {
      const { data, error } = await supabase
        .from("offers")
        .select("title, description, discount_text, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(o => ({
        tag: o.discount_text ?? "Offer",
        title: o.title,
        desc: o.description ?? "",
      }));
    },
  });
  return query.data && query.data.length ? query.data : fallback;
}

export function useTestimonials(fallback: ReviewItem[]) {
  const query = useQuery({
    queryKey: ["public", "testimonials"],
    staleTime: 60_000,
    queryFn: async (): Promise<ReviewItem[]> => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("name, location, message, rating, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(t => ({
        name: t.name,
        role: t.location ?? "",
        text: t.message,
        rating: t.rating ?? 5,
      }));
    },
  });
  return query.data && query.data.length ? query.data : fallback;
}

export function useFaqs(fallback: FaqItem[]) {
  const query = useQuery({
    queryKey: ["public", "faqs"],
    staleTime: 60_000,
    queryFn: async (): Promise<FaqItem[]> => {
      const { data, error } = await supabase
        .from("faqs")
        .select("question, answer, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(f => ({ q: f.question, a: f.answer }));
    },
  });
  return query.data && query.data.length ? query.data : fallback;
}
