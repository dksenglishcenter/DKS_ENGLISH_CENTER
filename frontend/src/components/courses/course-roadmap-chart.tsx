import type { CourseRoadmap } from "@/lib/courses/types";

type CourseRoadmapChartProps = {
  roadmap: CourseRoadmap;
  accent?: string;
};

/** Đồ họa lộ trình dạng cột tăng dần (tham khảo IELTS-Fighter). */
export function CourseRoadmapChart({
  roadmap,
  accent = "var(--primary)",
}: CourseRoadmapChartProps) {
  const stages = roadmap.stages;
  if (stages.length === 0) return null;

  const maxH = 160;
  const minH = 56;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 overflow-x-auto pb-1 sm:gap-3">
        {stages.map((stage, index) => {
          const height =
            stages.length === 1
              ? maxH
              : minH + ((maxH - minH) * index) / (stages.length - 1);
          return (
            <div
              key={`${stage.name}-${index}`}
              className="flex min-w-[4.5rem] flex-1 flex-col items-center gap-2 sm:min-w-0"
            >
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-t-xl px-1.5 pb-2 pt-3 text-center shadow-sm"
                style={{
                  height,
                  background: `linear-gradient(180deg, ${accent} 0%, color-mix(in srgb, ${accent} 72%, #3d2a1c) 100%)`,
                }}
              >
                {stage.band ? (
                  <span className="text-[0.65rem] font-bold leading-tight text-white/95 font-[family-name:var(--font-nunito)] sm:text-xs">
                    {stage.band}
                  </span>
                ) : null}
              </div>
              <div className="w-full rounded-lg border border-border bg-card px-1.5 py-2 text-center">
                <p className="text-[0.65rem] font-black leading-snug text-foreground font-[family-name:var(--font-nunito)] sm:text-xs">
                  {stage.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {stages.map((stage, index) => (
          <li
            key={`detail-${stage.name}-${index}`}
            className="rounded-xl border border-border bg-secondary/60 p-3"
          >
            <p className="mb-1.5 text-xs font-black text-foreground font-[family-name:var(--font-nunito)]">
              {stage.band ? `${stage.name} · ${stage.band}` : stage.name}
            </p>
            <ul className="space-y-1">
              {stage.modules.map((mod) => (
                <li
                  key={mod}
                  className="text-[0.75rem] leading-relaxed text-muted-foreground"
                >
                  · {mod}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
