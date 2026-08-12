import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccountLayout } from "@/components/site/AccountLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account/reports")({
  head: () => ({
    meta: [
      { title: "My Lab Reports | NUSFA Diagnostic" },
      { name: "description", content: "View and download your published NUSFA Diagnostic lab reports securely from your patient account." },
      { property: "og:title", content: "My Lab Reports | NUSFA Diagnostic" },
      { property: "og:description", content: "View and download your lab reports securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});

async function signedUrl(path: string, download: boolean) {
  const { data, error } = await supabase.storage
    .from("reports")
    .createSignedUrl(path, 60 * 10, download ? { download: true } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

function ReportsPage() {
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["account", "reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const open = async (path: string, id: string, download: boolean) => {
    setBusy(id + download);
    try {
      window.open(await signedUrl(path, download), "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open report");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AccountLayout title="My Reports" description="Download your published lab reports.">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <p className="text-sm text-destructive">Could not load your reports.</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map(r => (
            <div key={r.id} className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-display font-semibold">{r.title}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.published_at ?? r.created_at).toLocaleDateString()}
                  {r.notes ? ` · ${r.notes}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={busy === r.id + "false"} onClick={() => open(r.file_path, r.id, false)}>
                  {busy === r.id + "false" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} View
                </Button>
                <Button size="sm" className="bg-gradient-primary" disabled={busy === r.id + "true"} onClick={() => open(r.file_path, r.id, true)}>
                  {busy === r.id + "true" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Your reports will appear here as soon as they are published by the lab.
        </div>
      )}
    </AccountLayout>
  );
}
