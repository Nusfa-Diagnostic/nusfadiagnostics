import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    denied: search["denied"] === true || search["denied"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Login | NUSFA Diagnostic" },
      { name: "description", content: "Secure staff access to the NUSFA Diagnostic administration console." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Login | NUSFA Diagnostic" },
      { property: "og:description", content: "Secure staff access to the NUSFA Diagnostic administration console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { denied } = Route.useSearch();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, user, isAdmin, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-elegant">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Restricted area</span>
        </div>
        <h1 className="font-display text-2xl font-bold mt-3">Admin sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Authorised administrators only.</p>
        {denied && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This account does not have admin access.
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ae">Email</Label>
            <Input id="ae" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap">Password</Label>
            <Input id="ap" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </Button>
        </form>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
