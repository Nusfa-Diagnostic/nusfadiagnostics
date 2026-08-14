import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password | NUSFA Diagnostic" },
      { name: "description", content: "Securely set a new password for your NUSFA Diagnostic account using your recovery link." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Set a New Password | NUSFA Diagnostic" },
      { property: "og:description", content: "Securely set a new password for your NUSFA Diagnostic account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        setEmail(data.session.user.email ?? null);
        setReady(true);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const strong = password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);
  const matches = password.length > 0 && password === confirm;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!strong) return toast.error("Password must be 10+ characters and include a letter and a number.");
    if (!matches) return toast.error("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", search: { denied: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-elegant">
        <div className="flex items-center gap-2 text-primary">
          <KeyRound className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Secure password setup</span>
        </div>
        <h1 className="font-display text-2xl font-bold mt-3">Set a new password</h1>

        {!ready ? (
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>
              This page only works when opened from the recovery link we email you. Open the most recent
              &ldquo;Reset password&rdquo; email and click the link again.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/admin/login", search: { denied: undefined } })}>
              Back to admin login
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mt-1">
              Setting the password for <span className="font-medium text-foreground">{email}</span>.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np">New password</Label>
                <Input id="np" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                <p className={`text-xs ${strong ? "text-primary" : "text-muted-foreground"}`}>
                  Minimum 10 characters, with at least one letter and one number.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cp">Confirm password</Label>
                <Input id="cp" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
                {confirm.length > 0 && !matches && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={busy || !strong || !matches}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save password
              </Button>
            </form>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Your password is sent directly to the secure auth service and never stored by this app.
            </p>
          </>
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
