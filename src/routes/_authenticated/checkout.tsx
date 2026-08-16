import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingBag, Home, Building2, ArrowRight, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useCart, type CartItem } from "@/lib/cart";
import { useTests, usePackages } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Confirm Your Booking | NUSFA Diagnostic" },
      { name: "description", content: "Confirm your NUSFA Diagnostic lab booking — choose home sample collection or lab visit, pick a slot and submit securely." },
      { property: "og:title", content: "Confirm Your Booking | NUSFA Diagnostic" },
      { property: "og:description", content: "Choose home collection or lab visit and confirm your lab booking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

type Form = {
  first_name: string;
  last_name: string;
  age: string;
  gender: string;
  referral: string;
  contact_phone: string;
  contact_email: string;
  collection_type: "home_collection" | "lab_visit";
  address: string;
  city: string;
  pincode: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_notes: string;
};

const EMPTY: Form = {
  first_name: "", last_name: "", age: "", gender: "", referral: "",
  contact_phone: "", contact_email: "", collection_type: "home_collection",
  address: "", city: "", pincode: "", scheduled_date: "", scheduled_time: "", customer_notes: "",
};

const SLOTS = ["06:00 - 08:00 AM", "08:00 - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 - 03:00 PM", "03:00 - 06:00 PM"];
const GENDERS = ["Male", "Female", "Other"];

function CheckoutPage() {
  const { user } = useAuth();
  const { items: cartItems, clear } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<CartItem[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const { tests } = useTests();
  const { packages } = usePackages();

  // Preselect whatever the visitor chose via "Book Now" / cart.
  useEffect(() => {
    if (!seeded && cartItems.length > 0) {
      setSelected(cartItems);
      setSeeded(true);
    }
  }, [cartItems, seeded]);

  const total = selected.reduce((s, i) => s + i.price, 0);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["account", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      const parts = (profile.full_name ?? "").trim().split(/\s+/).filter(Boolean);
      setForm(f => ({
        ...f,
        first_name: f.first_name || (parts[0] ?? ""),
        last_name: f.last_name || parts.slice(1).join(" "),
        contact_phone: f.contact_phone || profile.phone || "",
        contact_email: f.contact_email || profile.email || user?.email || "",
        gender: f.gender || (profile.gender ?? ""),
        address: f.address || profile.address || "",
        city: f.city || profile.city || "",
        pincode: f.pincode || profile.pincode || "",
      }));
    }
  }, [profile, user?.email]);

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const catalog = useMemo<CartItem[]>(() => [
    ...tests.map(t => ({ id: `test-${t.slug}`, type: "test" as const, name: t.name, price: t.price, image: t.image })),
    ...packages.map(p => ({ id: `pkg-${p.slug}`, type: "package" as const, name: p.name, price: p.price, image: p.image })),
  ], [tests, packages]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedIds = new Set(selected.map(s => s.id));
    return catalog.filter(c => !selectedIds.has(c.id) && (!q || c.name.toLowerCase().includes(q))).slice(0, 8);
  }, [catalog, query, selected]);

  const addItem = (item: CartItem) => {
    setSelected(prev => (prev.some(p => p.id === item.id) ? prev : [...prev, item]));
    setErrors(e => ({ ...e, items: "" }));
    setQuery("");
  };
  const removeItem = (id: string) => setSelected(prev => prev.filter(p => p.id !== id));

  function validate() {
    const e: Record<string, string> = {};
    if (form.first_name.trim().length < 2) e["first_name"] = "Enter the patient's first name.";
    if (!form.last_name.trim()) e["last_name"] = "Enter the patient's last name.";
    const age = Number(form.age);
    if (!form.age.trim() || !Number.isFinite(age) || age < 1 || age > 120) e["age"] = "Enter a valid age (1-120).";
    if (!form.gender) e["gender"] = "Select a gender.";
    if (!/^[0-9]{10}$/.test(form.contact_phone.replace(/\D/g, "").slice(-10))) e["contact_phone"] = "Enter a valid 10-digit mobile number.";
    if (form.contact_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) e["contact_email"] = "Enter a valid email address.";
    if (form.collection_type === "home_collection") {
      if (form.address.trim().length < 8) e["address"] = "Enter the full collection address.";
      if (!form.city.trim()) e["city"] = "City is required.";
      if (!/^[0-9]{6}$/.test(form.pincode.trim())) e["pincode"] = "Enter a valid 6-digit pincode.";
    }
    if (!form.scheduled_date) e["scheduled_date"] = "Choose a preferred date.";
    else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.scheduled_date) < today) e["scheduled_date"] = "Date cannot be in the past.";
    }
    if (!form.scheduled_time) e["scheduled_time"] = "Choose a preferred time slot.";
    if (selected.length === 0) e["items"] = "Add at least one test or package.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const submit = useMutation({
    mutationFn: async () => {
      const testSlugs = selected.filter(i => i.type === "test").map(i => i.id.replace(/^test-/, ""));
      const pkgSlugs = selected.filter(i => i.type === "package").map(i => i.id.replace(/^pkg-/, ""));

      const [testRows, pkgRows] = await Promise.all([
        testSlugs.length
          ? supabase.from("tests").select("id, slug, name, price").in("slug", testSlugs)
          : Promise.resolve({ data: [], error: null } as const),
        pkgSlugs.length
          ? supabase.from("packages").select("id, slug, name, price").in("slug", pkgSlugs)
          : Promise.resolve({ data: [], error: null } as const),
      ]);
      if (testRows.error) throw testRows.error;
      if (pkgRows.error) throw pkgRows.error;

      const testBySlug = new Map((testRows.data ?? []).map(r => [r.slug, r]));
      const pkgBySlug = new Map((pkgRows.data ?? []).map(r => [r.slug, r]));

      const lineItems = selected.map(i => {
        const slug = i.id.replace(/^(test|pkg)-/, "");
        const row = i.type === "test" ? testBySlug.get(slug) : pkgBySlug.get(slug);
        return {
          item_type: i.type,
          test_id: i.type === "test" ? row?.id ?? null : null,
          package_id: i.type === "package" ? row?.id ?? null : null,
          item_name: row?.name ?? i.name,
          price: Number(row?.price ?? i.price),
        };
      });

      const amount = lineItems.reduce((s, l) => s + l.price, 0);
      const homeCollection = form.collection_type === "home_collection";
      const fullName = `${form.first_name.trim()} ${form.last_name.trim()}`.trim();

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user!.id,
          contact_name: fullName,
          patient_first_name: form.first_name.trim(),
          patient_last_name: form.last_name.trim(),
          patient_age: Number(form.age),
          patient_gender: form.gender,
          referral: form.referral.trim() || null,
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim() || null,
          collection_type: form.collection_type,
          address: homeCollection ? form.address.trim() : null,
          city: homeCollection ? form.city.trim() : null,
          pincode: homeCollection ? form.pincode.trim() : null,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
          amount,
          customer_notes: form.customer_notes.trim() || null,
        })
        .select("id, booking_number")
        .single();
      if (bookingError) throw bookingError;

      const { error: itemsError } = await supabase
        .from("booking_items")
        .insert(lineItems.map(l => ({ ...l, booking_id: booking.id })));
      if (itemsError) throw itemsError;

      return booking;
    },
    onSuccess: async booking => {
      clear();
      await qc.invalidateQueries({ queryKey: ["account"] });
      toast.success(`Booking ${booking.booking_number} confirmed`);
      navigate({ to: "/account/bookings/$id", params: { id: booking.id }, replace: true });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not create your booking. Please try again.");
    },
  });

  if (selected.length === 0 && cartItems.length === 0 && !submit.isPending && !submit.isSuccess && !pickerOpen) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary mb-5">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No tests selected</h1>
          <p className="text-muted-foreground mb-6">Pick a test or package to continue with your booking.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-gradient-primary"><Link to="/tests">Browse Tests</Link></Button>
            <Button asChild variant="outline"><Link to="/packages">Browse Packages</Link></Button>
            <Button variant="ghost" onClick={() => setPickerOpen(true)}>Add test here</Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Book Your Test</h1>
          <p className="text-white/80 mt-2 text-sm">Fill in the patient details, choose a slot and confirm. Our team will call to confirm shortly.</p>
        </div>
      </section>

      <section className="py-12">
        <form
          className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]"
          onSubmit={e => { e.preventDefault(); if (validate()) submit.mutate(); }}
          noValidate
        >
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-display font-bold text-lg">Patient Details</h2>
              {profileLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading your details…</p>}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name" error={errors["first_name"]}>
                  <Input value={form.first_name} onChange={e => set("first_name", e.target.value)} placeholder="First name" />
                </Field>
                <Field label="Last name" error={errors["last_name"]}>
                  <Input value={form.last_name} onChange={e => set("last_name", e.target.value)} placeholder="Last name" />
                </Field>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Age" error={errors["age"]}>
                  <Input value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" placeholder="Years" />
                </Field>
                <Field label="Gender" error={errors["gender"]}>
                  <select
                    value={form.gender}
                    onChange={e => set("gender", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Referral (optional)">
                  <Input value={form.referral} onChange={e => set("referral", e.target.value)} placeholder="Doctor / clinic" />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Mobile number" error={errors["contact_phone"]}>
                  <Input value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} inputMode="tel" placeholder="10-digit mobile" />
                </Field>
                <Field label="Email (optional)" error={errors["contact_email"]}>
                  <Input value={form.contact_email} onChange={e => set("contact_email", e.target.value)} type="email" placeholder="you@example.com" />
                </Field>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-display font-bold text-lg">Collection & Schedule</h2>
              <div>
                <Label className="mb-2 block">Collection preference</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {([
                    { v: "home_collection", label: "Home Collection", desc: "Free pickup at your address", icon: Home },
                    { v: "lab_visit", label: "Lab Visit", desc: "Walk in to our NUSFA lab", icon: Building2 },
                  ] as const).map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => set("collection_type", opt.v)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                        form.collection_type === opt.v ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
                      )}
                    >
                      <opt.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <span className="block font-semibold text-sm">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {form.collection_type === "home_collection" && (
                <div className="space-y-4">
                  <Field label="Collection address" error={errors["address"]}>
                    <Textarea rows={2} value={form.address} onChange={e => set("address", e.target.value)} placeholder="House / street / landmark" />
                  </Field>
                  <p className="text-xs text-muted-foreground -mt-2">Editing the address here applies to this booking only — your saved profile address stays unchanged.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="City" error={errors["city"]}>
                      <Input value={form.city} onChange={e => set("city", e.target.value)} />
                    </Field>
                    <Field label="Pincode" error={errors["pincode"]}>
                      <Input value={form.pincode} onChange={e => set("pincode", e.target.value)} inputMode="numeric" />
                    </Field>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Preferred date" error={errors["scheduled_date"]}>
                  <Input type="date" value={form.scheduled_date} onChange={e => set("scheduled_date", e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field label="Preferred time slot" error={errors["scheduled_time"]}>
                  <select
                    value={form.scheduled_time}
                    onChange={e => set("scheduled_time", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select a slot</option>
                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Notes for the lab (optional)">
                <Textarea rows={3} value={form.customer_notes} onChange={e => set("customer_notes", e.target.value)} placeholder="Any medical condition, preferred phlebotomist gender, etc." />
              </Field>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display font-bold text-lg">Test Selection</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(o => !o)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Test
                </Button>
              </div>

              <ul className="space-y-3">
                {selected.map(i => (
                  <li key={i.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{i.type}</div>
                      <div className="font-medium text-sm truncate">{i.name}</div>
                    </div>
                    <div className="font-bold whitespace-nowrap">₹{i.price}</div>
                    <button type="button" onClick={() => removeItem(i.id)} aria-label={`Remove ${i.name}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
                {selected.length === 0 && <li className="text-sm text-muted-foreground">No tests selected yet.</li>}
              </ul>
              {errors["items"] && <p className="text-xs text-destructive">{errors["items"]}</p>}

              {pickerOpen && (
                <div className="rounded-xl border border-border p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tests or packages" className="pl-9" />
                  </div>
                  <ul className="max-h-64 overflow-auto divide-y divide-border">
                    {results.map(r => (
                      <li key={r.id}>
                        <button type="button" onClick={() => addItem(r)}
                          className="w-full flex items-center justify-between gap-3 py-2.5 px-1 text-left hover:bg-secondary rounded-md">
                          <span className="min-w-0">
                            <span className="block text-sm font-medium truncate">{r.name}</span>
                            <span className="text-[10px] uppercase tracking-wider text-primary">{r.type}</span>
                          </span>
                          <span className="text-sm font-semibold whitespace-nowrap">₹{r.price}</span>
                        </button>
                      </li>
                    ))}
                    {results.length === 0 && <li className="py-3 text-sm text-muted-foreground">No matching items.</li>}
                  </ul>
                </div>
              )}

              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Selected items subtotal</span><span>₹{total}</span>
              </div>
            </div>
          </div>

          <aside className="glass-card rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-xl mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4 pb-4 border-b border-border">
              {selected.map(i => (
                <li key={i.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{i.name}</span>
                    <span className="text-xs uppercase tracking-wider text-primary">{i.type}</span>
                  </span>
                  <span className="font-semibold whitespace-nowrap">₹{i.price}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm mb-2"><span>Home collection</span><span className="text-success">Free</span></div>
            <div className="flex justify-between font-bold text-lg mb-5"><span>Total payable</span><span>₹{total}</span></div>
            <p className="text-xs text-muted-foreground mb-4">Payment is collected at the time of sample collection or lab visit.</p>
            <Button type="submit" disabled={submit.isPending || submit.isSuccess} className="w-full bg-gradient-primary">
              {submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Booking…</> : <>Book Now <ArrowRight className="h-4 w-4 ml-1" /></>}
            </Button>
            <Button asChild variant="ghost" className="w-full mt-2"><Link to="/cart">Back to cart</Link></Button>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
