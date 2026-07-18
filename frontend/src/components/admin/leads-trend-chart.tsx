import type { LeadsTrendPoint } from "@/lib/dashboard/types";

// SVG coordinate space (scaled to container width via viewBox).
const W = 600;
const H = 160;
const PAD_X = 10;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;

function ddmm(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

// Area + line chart of daily submissions over the period.
export function LeadsTrendChart({ points }: { points?: LeadsTrendPoint[] }) {
  const data = points ?? [];

  // Guard: older backend deploys may not return leadsTrend yet.
  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-base font-bold text-foreground">Đơn gửi mỗi ngày</h3>
        <p className="text-xs text-muted-foreground">
          Liên hệ + ứng tuyển · 30 ngày qua
        </p>
        <p className="mt-6 text-sm text-muted-foreground">Chưa có dữ liệu.</p>
      </div>
    );
  }

  const total = data.reduce((sum, p) => sum + p.count, 0);
  const max = Math.max(...data.map((p) => p.count), 1);
  const n = data.length;

  const x = (i: number) =>
    PAD_X + (i * (W - PAD_X * 2)) / Math.max(n - 1, 1);
  const y = (value: number) =>
    H - PAD_BOTTOM - (value / max) * (H - PAD_TOP - PAD_BOTTOM);

  const linePath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.count).toFixed(1)}`)
    .join(" ");
  const baseline = H - PAD_BOTTOM;
  const areaPath = `M ${x(0).toFixed(1)} ${baseline} ${data
    .map((p, i) => `L ${x(i).toFixed(1)} ${y(p.count).toFixed(1)}`)
    .join(" ")} L ${x(n - 1).toFixed(1)} ${baseline} Z`;

  const mid = Math.floor((n - 1) / 2);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Đơn gửi mỗi ngày
          </h3>
          <p className="text-xs text-muted-foreground">Liên hệ + ứng tuyển · 30 ngày qua</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
            {total}
          </p>
          <p className="text-xs text-muted-foreground">tổng đơn</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ aspectRatio: `${W} / ${H}` }}
        role="img"
        aria-label={`Biểu đồ đơn gửi 30 ngày, tổng ${total}`}
      >
        <defs>
          <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F16522" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F16522" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line
          x1={PAD_X}
          y1={baseline}
          x2={W - PAD_X}
          y2={baseline}
          stroke="#F0DDCF"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        <path d={areaPath} fill="url(#leadsFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#F16522"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* markers on days that have submissions */}
        {data.map((p, i) =>
          p.count > 0 ? (
            <circle
              key={p.date}
              cx={x(i)}
              cy={y(p.count)}
              r={3.5}
              fill="#fff"
              stroke="#F16522"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${ddmm(p.date)}: ${p.count} đơn`}</title>
            </circle>
          ) : null,
        )}
      </svg>

      {/* x-axis labels: start / middle / end */}
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{ddmm(data[0]?.date ?? "")}</span>
        <span>{ddmm(data[mid]?.date ?? "")}</span>
        <span>{ddmm(data[n - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}
