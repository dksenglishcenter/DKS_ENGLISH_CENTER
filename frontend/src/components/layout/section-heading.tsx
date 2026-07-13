export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block bg-primary/10 text-primary rounded-full px-5 py-1.5 text-sm font-bold mb-4 tracking-wide uppercase font-[family-name:var(--font-nunito)]">
      {children}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  sub,
  titleId,
}: {
  label: string;
  title: string;
  sub?: string;
  titleId?: string;
}) {
  return (
    <div className="text-center mb-14">
      <SectionLabel>{label}</SectionLabel>
      <h2
        id={titleId}
        className="text-3xl md:text-4xl font-black text-[#4A2306] mb-4 font-[family-name:var(--font-nunito)]"
      >
        {title}
      </h2>
      {sub && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-[family-name:var(--font-body)]">
          {sub}
        </p>
      )}
    </div>
  );
}
