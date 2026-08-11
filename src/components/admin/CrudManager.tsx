import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type FieldType =
  | "text" | "textarea" | "number" | "switch" | "image" | "list" | "faq" | "date" | "select";

export interface CrudField {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
  help?: string;
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

type Row = Record<string, any>;

export function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function uploadMedia(file: File) {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signErr) throw signErr;
  return data.signedUrl;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder="Image URL or upload" />
        <Button type="button" variant="outline" disabled={busy} asChild>
          <label className="cursor-pointer">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  onChange(await uploadMedia(file));
                  toast.success("Image uploaded");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
        </Button>
      </div>
      {value ? <img src={value} alt="" className="h-24 w-40 rounded-lg object-cover border border-border" /> : null}
    </div>
  );
}

function FaqField({ value, onChange }: { value: { q: string; a: string }[]; onChange: (v: { q: string; a: string }[]) => void }) {
  const items = Array.isArray(value) ? value : [];
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-border p-3 space-y-2">
          <Input
            value={it.q}
            placeholder="Question"
            onChange={e => onChange(items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
          />
          <Textarea
            value={it.a}
            placeholder="Answer"
            onChange={e => onChange(items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
          />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { q: "", a: "" }])}>
        <Plus className="h-4 w-4" /> Add FAQ
      </Button>
    </div>
  );
}

export function CrudManager({
  table,
  title,
  description,
  fields,
  columns,
  defaults,
  searchFields = ["name"],
  orderBy = "sort_order",
  ascending = true,
}: {
  table: string;
  title: string;
  description?: string;
  fields: CrudField[];
  columns: CrudColumn[];
  defaults: Row;
  searchFields?: string[];
  orderBy?: string;
  ascending?: boolean;
}) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const payload: Row = {};
      for (const f of fields) payload[f.name] = row[f.name];
      if ("slug" in payload && !payload["slug"] && row["name"]) payload["slug"] = slugify(String(row["name"]));
      if (row["id"]) {
        const { error } = await supabase.from(table as never).update(payload as never).eq("id", row["id"]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table as never).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase.from(table as never).delete().eq("id", row["id"]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      qc.invalidateQueries({ queryKey: ["admin", table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter(r =>
    !q ? true : searchFields.some(f => String(r[f] ?? "").toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Button onClick={() => setEditing({ ...defaults })}>
          <Plus className="h-4 w-4" /> Add new
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : error ? (
          <div className="p-10 text-center text-destructive text-sm">Could not load data. Please retry.</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Nothing here yet. Click “Add new” to create your first entry.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  {columns.map(c => <th key={c.key} className="px-4 py-3 font-semibold whitespace-nowrap">{c.label}</th>)}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={String(r["id"])} className="border-t border-border">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3 align-middle">
                        {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => setEditing({ ...r })} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? "Edit" : "Add"} — {title}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(f => {
                const value = editing[f.name];
                const set = (v: unknown) => setEditing({ ...editing, [f.name]: v });
                return (
                  <div key={f.name} className={f.full || f.type === "textarea" || f.type === "faq" ? "sm:col-span-2 space-y-2" : "space-y-2"}>
                    <Label>{f.label}</Label>
                    {f.type === "textarea" && <Textarea value={value ?? ""} onChange={e => set(e.target.value)} placeholder={f.placeholder} rows={3} />}
                    {f.type === "text" && <Input value={value ?? ""} onChange={e => set(e.target.value)} placeholder={f.placeholder} />}
                    {f.type === "date" && <Input type="date" value={value ?? ""} onChange={e => set(e.target.value || null)} />}
                    {f.type === "number" && <Input type="number" value={value ?? ""} onChange={e => set(e.target.value === "" ? null : Number(e.target.value))} />}
                    {f.type === "switch" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Switch checked={!!value} onCheckedChange={set} />
                        <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
                      </div>
                    )}
                    {f.type === "image" && <ImageField value={value ?? ""} onChange={set} />}
                    {f.type === "list" && (
                      <Textarea
                        rows={4}
                        value={Array.isArray(value) ? value.join("\n") : ""}
                        onChange={e => set(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                        placeholder="One item per line"
                      />
                    )}
                    {f.type === "faq" && <FaqField value={value ?? []} onChange={set} />}
                    {f.type === "select" && (
                      <Select value={value ? String(value) : ""} onValueChange={v => set(v)}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {(f.options ?? []).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>;
}
