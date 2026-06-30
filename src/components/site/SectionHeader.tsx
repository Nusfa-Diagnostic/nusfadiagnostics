export function SectionHeader({
  eyebrow, title, description, align = "center",
}: { eyebrow?: string; title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} mb-10 md:mb-14`}>
      {eyebrow && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3 ${align === "center" ? "" : ""}`}>
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}
