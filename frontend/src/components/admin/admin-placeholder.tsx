export default function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-8">
      <h2 className="text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[#9B6B50]">{description}</p>
    </div>
  );
}
