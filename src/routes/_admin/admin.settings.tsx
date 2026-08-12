import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({ meta: [{ title: "Website Settings | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminSettings,
});

const FIELDS = [
  { key: "phone_primary", label: "Primary phone", area: false },
  { key: "phone_secondary", label: "Secondary phone", area: false },
  { key: "home_collection_phone", label: "Home collection number", area: false },
  { key: "whatsapp", label: "WhatsApp number", area: false },
  { key: "email", label: "Email", area: false },
  { key: "address", label: "Address", area: true },
  { key: "map_embed", label: "Google Maps embed URL", area: true },
  { key: "facebook", label: "Facebook URL", area: false },
  { key: "instagram", label: "Instagram URL", area: false },
  { key: "youtube", label: "YouTube URL", area: false },
  { key: "footer_text", label: "Footer text", area: true },
] as const;

function AdminSettings() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const row of data) {
      const v = row.value as unknown;
      next[row.key] = typeof v === "string" ? v : ((v as { value?: string })?.value ?? "");
    }
    setForm(f => ({ ...next, ...f }));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = FIELDS.map(f => ({ key: f.key, value: { value: form[f.key] ?? "" } }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Website Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Contact details, social links and footer content.</p>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <form
          className="rounded-2xl border border-border bg-card p-6 grid gap-4 sm:grid-cols-2 max-w-4xl"
          onSubmit={e => { e.preventDefault(); save.mutate(); }}
        >
          {FIELDS.map(f => (
            <div key={f.key} className={f.area ? "sm:col-span-2 space-y-2" : "space-y-2"}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.area ? (
                <Textarea id={f.key} rows={2} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <Input id={f.key} value={form[f.key] ?? ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
