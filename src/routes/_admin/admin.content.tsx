import { createFileRoute } from "@tanstack/react-router";
import { ActiveBadge, CrudManager } from "@/components/admin/CrudManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_admin/admin/content")({
  head: () => ({ meta: [{ title: "Website Content | NUSFA Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminContent,
});

function AdminContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Website Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Homepage slider, categories, offers, testimonials and FAQs.</p>
      </div>
      <Tabs defaultValue="slides">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="slides">Hero Slider</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="mt-6">
          <CrudManager
            table="hero_slides"
            title="Hero Slider"
            searchFields={["title"]}
            defaults={{ title: "", subtitle: "", description: "", image_url: "", cta_text: "", cta_link: "", sort_order: 0, is_active: true }}
            fields={[
              { name: "title", label: "Title", type: "text" },
              { name: "subtitle", label: "Subtitle", type: "text" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "image_url", label: "Background image", type: "image", full: true },
              { name: "cta_text", label: "Button text", type: "text" },
              { name: "cta_link", label: "Button link", type: "text", placeholder: "/tests" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Active", type: "switch" },
            ]}
            columns={[
              { key: "title", label: "Title" },
              { key: "sort_order", label: "Order" },
              { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CrudManager
            table="test_categories"
            title="Test Categories"
            searchFields={["name"]}
            defaults={{ name: "", slug: "", description: "", sort_order: 0, is_active: true }}
            fields={[
              { name: "name", label: "Name", type: "text" },
              { name: "slug", label: "Slug", type: "text", help: "Leave blank to auto-generate." },
              { name: "description", label: "Description", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Active", type: "switch" },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "slug", label: "Slug" },
              { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <CrudManager
            table="offers"
            title="Offers"
            searchFields={["title", "coupon_code"]}
            defaults={{ title: "", description: "", image_url: "", discount_text: "", coupon_code: "", starts_at: null, ends_at: null, sort_order: 0, is_active: true }}
            fields={[
              { name: "title", label: "Title", type: "text" },
              { name: "discount_text", label: "Discount text", type: "text", placeholder: "Flat 30% OFF" },
              { name: "coupon_code", label: "Coupon code", type: "text" },
              { name: "image_url", label: "Banner image", type: "image", full: true },
              { name: "description", label: "Description", type: "textarea" },
              { name: "starts_at", label: "Starts on", type: "date" },
              { name: "ends_at", label: "Ends on", type: "date" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Active", type: "switch" },
            ]}
            columns={[
              { key: "title", label: "Title" },
              { key: "discount_text", label: "Discount" },
              { key: "coupon_code", label: "Code" },
              { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <CrudManager
            table="testimonials"
            title="Testimonials"
            searchFields={["name", "location"]}
            defaults={{ name: "", location: "", rating: 5, message: "", avatar_url: "", sort_order: 0, is_active: true }}
            fields={[
              { name: "name", label: "Customer name", type: "text" },
              { name: "location", label: "Location", type: "text" },
              { name: "rating", label: "Rating (1-5)", type: "number" },
              { name: "avatar_url", label: "Avatar", type: "image", full: true },
              { name: "message", label: "Message", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Active", type: "switch" },
            ]}
            columns={[
              { key: "name", label: "Name" },
              { key: "rating", label: "Rating" },
              { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
            ]}
          />
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <CrudManager
            table="faqs"
            title="FAQs"
            searchFields={["question"]}
            defaults={{ question: "", answer: "", sort_order: 0, is_active: true }}
            fields={[
              { name: "question", label: "Question", type: "text", full: true },
              { name: "answer", label: "Answer", type: "textarea" },
              { name: "sort_order", label: "Sort order", type: "number" },
              { name: "is_active", label: "Active", type: "switch" },
            ]}
            columns={[
              { key: "question", label: "Question" },
              { key: "is_active", label: "Status", render: r => <ActiveBadge active={!!r["is_active"]} /> },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
