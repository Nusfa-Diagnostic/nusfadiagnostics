import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingBag, Home, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
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
  contact_name: string;
  contact_phone: string;
  collection_type: "home_collection" | "lab_visit";
  address: string;
  city: string;
  pincode: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_notes: string;
};

const EMPTY: Form = {
  contact_name: "", contact_phone: "", collection_type: "home_collection",
  address: "", city: "", pincode: "", scheduled_date: "", scheduled_time: "", customer_notes: "",
};

const SLOTS = ["06:00 - 08:00 AM", "08:00 - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 - 03:00 PM", "03:00 - 06:00 PM"];

function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setForm(f => ({
        ...f,
        contact_name: f.contact_name || profile.full_name || "",
        contact_phone: f.contact_phone || profile.phone || "",
        address: f.address || profile.address || "",
        city: f.city || profile.city || "",
        pincode: f.pincode || profile.pincode || "",
      }));
    }
  }, [profile]);

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  function validate() {
    const e: Record<string, string> = {};
    if (form.contact_name.trim().length < 2) e["contact_name"] = "Enter the patient's full name.";
    if (!/^[0-9]{10}$/.test(form.contact_phone.replace(/\D/g, "").slice(-10))) e["contact_phone"] = "Enter a valid 10-digit mobile number.";
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
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const submit = useMutation({
    mutationFn: async () => {
      const testSlugs = items.filter(i => i.type === "test").map(i => i.id.replace(/^test-/, ""));
      const pkgSlugs = items.filter(i => i.type === "package").map(i => i.id.replace(/^pkg-/, ""));

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

      const lineItems = items.map(i => {
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

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user!.id,
          contact_name: form.contact_name.trim(),
          contact_phone: form.contact_phone.trim(),
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

  if (items.length === 0 && !submit.isPending && !submit.isSuccess) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary mb-5">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add a test or package to continue with booking.</p>
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-gradient-primary"><Link to="/tests">Browse Tests</Link></Button>
            <Button asChild variant="outline"><Link to="/packages">Browse Packages</Link></Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-gradient-hero text-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Confirm Your Booking</h1>
          <p className="text-white/80 mt-2 text-sm">Choose your collection preference and slot. Our team will confirm shortly.</p>
        </div>
      </section>

      <section className="py-12">
        <form
          className="mx-auto max-w-7xl px-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]"
          onSubmit={e => { e.preventDefault(); if (validate()) submit.mutate(); }}
          noValidate
        >
          <div className="glass-card rounded-2xl p-6 space-y-5">
            {profileLoading && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading your details…</p>}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Patient name" error={errors["contact_name"]}>
                <Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Mobile number" error={errors["contact_phone"]}>
                <Input value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} inputMode="tel" placeholder="10-digit mobile" />
              </Field>
            </div>

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

          <aside className="glass-card rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-xl mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4 pb-4 border-b border-border">
              {items.map(i => (
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
            <Button type="submit" disabled={submit.isPending} className="w-full bg-gradient-primary">
              {submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Confirming…</> : <>Confirm Booking <ArrowRight className="h-4 w-4 ml-1" /></>}
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
