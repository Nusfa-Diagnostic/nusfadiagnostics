import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActiveBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_admin/admin/tests")({
  head: () => ({ meta: [{ title: "Manage Tests | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminTests,
});

function AdminTests() {
  const { data: categories } = useQuery({
    queryKey: ["admin", "test_categories", "options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("test_categories").select("id,name").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const catOptions = (categories ?? []).map(c => ({ value: c.id, label: c.name }));

  return (
    <CrudManager
      table="tests"
      title="Tests"
      description="Create and manage every diagnostic test shown on the website."
      searchFields={["name", "slug"]}
      defaults={{
        name: "", slug: "", category_id: null, price: 0, mrp: null, discount_percent: null,
        image_url: "", short_description: "", description: "", why_required: "", preparation: "",
        fasting_required: "", sample_type: "", report_time: "", faqs: [], is_featured: false,
        is_active: true, sort_order: 0,
      }}
      fields={[
        { name: "name", label: "Test name", type: "text" },
        { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate from the name." },
        { name: "category_id", label: "Category", type: "select", options: catOptions },
        { name: "price", label: "Price (₹)", type: "number" },
        { name: "mrp", label: "MRP (₹)", type: "number" },
        { name: "discount_percent", label: "Discount %", type: "number" },
        { name: "sample_type", label: "Sample type", type: "text" },
        { name: "fasting_required", label: "Fasting required", type: "text" },
        { name: "report_time", label: "Report delivery time", type: "text" },
        { name: "image_url", label: "Image", type: "image", full: true },
        { name: "short_description", label: "Short description", type: "textarea" },
        { name: "description", label: "Full description", type: "textarea" },
        { name: "why_required", label: "Why required", type: "textarea" },
        { name: "preparation", label: "Preparation", type: "textarea" },
        { name: "faqs", label: "FAQs", type: "faq" },
        { name: "is_featured", label: "Featured on homepage", type: "switch" },
        { name: "is_active", label: "Active", type: "switch" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "price", label: "Price", render: r => `₹${r["price"]}` },
        { key: "is_featured", label: "Featured", render: r => (r["is_featured"] ? "Yes" : "No") },
        { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
      ]}
    />
  );
}
