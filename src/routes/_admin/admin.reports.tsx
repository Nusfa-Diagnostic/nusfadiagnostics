import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_admin/admin/reports")({
  head: () => ({ meta: [{ title: "Reports | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminReports,
});

type Draft = {
  customer_id: string; booking_id: string; title: string; notes: string;
  file_path: string; file_size: number | null; is_published: boolean;
};

const EMPTY: Draft = { customer_id: "", booking_id: "", title: "", notes: "", file_path: "", file_size: null, is_published: true };

function AdminReports() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const [reports, profiles, bookings] = await Promise.all([
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,full_name,email,customer_code"),
        supabase.from("bookings").select("id,booking_number,customer_id").order("created_at", { ascending: false }),
      ]);
      if (reports.error) throw reports.error;
      return { reports: reports.data ?? [], profiles: profiles.data ?? [], bookings: bookings.data ?? [] };
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      if (!d.customer_id || !d.file_path || !d.title) throw new Error("Customer, title and PDF file are required");
      const { error } = await supabase.from("reports").insert({
        customer_id: d.customer_id,
        booking_id: d.booking_id || null,
        title: d.title,
        notes: d.notes || null,
        file_path: d.file_path,
        file_size: d.file_size,
        is_published: d.is_published,
        published_at: d.is_published ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from("reports")
        .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reports"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const customerCode = (id: string) => data?.profiles.find(x => x.id === id)?.customer_code ?? "—";
  const customerName = (id: string) => {
    const p = data?.profiles.find(x => x.id === id);
    return p?.full_name || p?.email || id.slice(0, 8);
  };

  const uploadPdf = async (file: File) => {
    setUploading(true);
    try {
      const path = `${draft?.customer_id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("reports").upload(path, file);
      if (error) throw error;
      setDraft(d => (d ? { ...d, file_path: path, file_size: file.size, title: d.title || file.name } : d));
      toast.success("PDF uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const bookingOptions = (data?.bookings ?? []).filter(b => !draft?.customer_id || b.customer_id === draft.customer_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload PDF reports and publish them to a customer's account.</p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}><Plus className="h-4 w-4" /> Upload report</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive">Could not load reports.</div>
        ) : data && data.reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>{["Title", "Customer", "Created", "Published", ""].map(h => <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.reports.map(r => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">{r.title}</td>
                    <td className="px-4 py-3">
                      <div>{customerName(r.customer_id)}</div>
                      <div className="text-xs font-semibold text-primary tabular-nums">{customerCode(r.customer_id)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.is_published ? "default" : "secondary"}>{r.is_published ? "Published" : "Draft"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => togglePublish.mutate({ id: r.id, publish: !r.is_published })}>
                        {r.is_published ? "Unpublish" : "Publish"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">No reports uploaded yet.</div>
        )}
      </div>

      <Dialog open={!!draft} onOpenChange={o => !o && setDraft(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Upload report</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={draft.customer_id} onValueChange={v => setDraft({ ...draft, customer_id: v, booking_id: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {(data?.profiles ?? []).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name || p.email || p.id.slice(0, 8)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Booking (optional)</Label>
                <Select value={draft.booking_id} onValueChange={v => setDraft({ ...draft, booking_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Link to a booking" /></SelectTrigger>
                  <SelectContent>
                    {bookingOptions.map(b => <SelectItem key={b.id} value={b.id}>{b.booking_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Report title</Label>
                <Input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>PDF file</Label>
                <Button type="button" variant="outline" disabled={uploading || !draft.customer_id} asChild>
                  <label className="cursor-pointer">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Choose PDF
                    <input type="file" accept="application/pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) void uploadPdf(f); }} />
                  </label>
                </Button>
                {!draft.customer_id && <p className="text-xs text-muted-foreground">Select a customer first.</p>}
                {draft.file_path && <p className="text-xs text-muted-foreground break-all">Uploaded: {draft.file_path}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_published} onCheckedChange={v => setDraft({ ...draft, is_published: v })} />
                <span className="text-sm">Publish immediately to customer</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={() => draft && save.mutate(draft)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
