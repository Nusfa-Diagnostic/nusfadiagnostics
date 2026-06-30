import { Phone, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/data";

export function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${BRAND.whatsapp}`}
        target="_blank" rel="noreferrer"
        aria-label="WhatsApp"
        className="grid h-13 w-13 h-[52px] w-[52px] place-items-center rounded-full text-white shadow-elegant hover:scale-105 transition-transform"
        style={{ background: "#25D366" }}
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={`tel:${BRAND.phones[0]}`}
        aria-label="Call"
        className="grid h-[52px] w-[52px] place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant hover:scale-105 transition-transform animate-float"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
