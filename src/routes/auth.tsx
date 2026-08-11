import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/data";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Patient Login & Signup | NUSFA Diagnostic" },
      { name: "description", content: "Sign in to your NUSFA Diagnostic account to book tests, track bookings and download your lab reports securely." },
      { property: "og:title", content: "Patient Login & Signup | NUSFA Diagnostic" },
      { property: "og:description", content: "Sign in to book tests, track bookings and download your lab reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(target: string | undefined) {
  if (!target) return "/account";
  if (!target.startsWith("/") || target.startsWith("//")) return "/account";
  return target;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });

  useEffect(() => {
    if (!loading && user) navigate({ to: safePath(redirect), replace: true });
  }, [user, loading, redirect, navigate]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: form.fullName, phone: form.phone },
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          toast.success("Account created");
        } else {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative bg-gradient-hero text-white p-12 items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">{BRAND.name}</h2>
          <p className="mt-3 text-white/80 text-lg">{BRAND.tagline}</p>
          <ul className="mt-10 space-y-4 text-white/85">
            <li>• Track every booking in real time</li>
            <li>• Download lab reports securely</li>
            <li>• Free home sample collection</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <h1 className="font-display text-3xl font-bold">
            {mode === "login" ? "Patient Login" : "Create your account"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "login" ? "Access your bookings and reports." : "Book tests and get reports online."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" required value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input id="phone" required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit mobile" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? "New to NUSFA?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Mobile OTP login can be enabled later — your mobile number is saved to your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
