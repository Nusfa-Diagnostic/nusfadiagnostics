import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout } from "@/components/site/AccountLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/account/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | NUSFA Diagnostic" },
      { name: "description", content: "Update your NUSFA Diagnostic patient profile — name, mobile number, address and collection details." },
      { property: "og:title", content: "My Profile | NUSFA Diagnostic" },
      { property: "og:description", content: "Manage your patient profile details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type Form = {
  full_name: string; phone: string; address: string; city: string;
  pincode: string; gender: string; date_of_birth: string;
};

const EMPTY: Form = { full_name: "", phone: "", address: "", city: "", pincode: "", gender: "", date_of_birth: "" };

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["account", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "",
        city: data.city ?? "", pincode: data.pincode ?? "", gender: data.gender ?? "",
        date_of_birth: data.date_of_birth ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").upsert({
        id: user!.id,
        email: user!.email ?? null,
        ...form,
        date_of_birth: form.date_of_birth || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["account", "profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AccountLayout title="Profile" description="Keep your contact and collection details up to date.">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <form
          className="glass-card rounded-2xl p-6 grid gap-4 sm:grid-cols-2 max-w-3xl"
          onSubmit={e => { e.preventDefault(); save.mutate(); }}
        >
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" value={form.gender} onChange={e => set("gender", e.target.value)} placeholder="Male / Female / Other" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={e => set("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" value={form.pincode} onChange={e => set("pincode", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="bg-gradient-primary" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </Button>
          </div>
        </form>
      )}
    </AccountLayout>
  );
}
