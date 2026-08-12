import { createFileRoute } from "@tanstack/react-router";
import { ActiveBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/_admin/admin/packages")({
  head: () => ({ meta: [{ title: "Manage Packages | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => (
    <CrudManager
      table="packages"
      title="Health Packages"
      description="Manage bundled health checkup packages."
      searchFields={["name", "slug"]}
      defaults={{
        name: "", slug: "", price: 0, mrp: null, discount_percent: null, image_url: "",
        short_description: "", description: "", includes: [], benefits: [], preparation: "",
        report_time: "", faqs: [], is_featured: false, is_active: true, sort_order: 0,
      }}
      fields={[
        { name: "name", label: "Package name", type: "text" },
        { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
        { name: "price", label: "Price (₹)", type: "number" },
        { name: "mrp", label: "MRP (₹)", type: "number" },
        { name: "discount_percent", label: "Discount %", type: "number" },
        { name: "report_time", label: "Report delivery time", type: "text" },
        { name: "image_url", label: "Image", type: "image", full: true },
        { name: "short_description", label: "Short description", type: "textarea" },
        { name: "description", label: "Full description", type: "textarea" },
        { name: "includes", label: "Included tests", type: "list", full: true, help: "One test name per line." },
        { name: "benefits", label: "Benefits", type: "list", full: true, help: "One benefit per line." },
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
  ),
});
