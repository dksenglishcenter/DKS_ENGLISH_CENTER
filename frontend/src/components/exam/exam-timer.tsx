"use client";

import { useEffect, useRef, useState } from "react";

function format(msLeft: number): string {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Counts down to `endsAt` (server-issued). Calls onExpire once at zero. */
export function ExamTimer({
  endsAt,
  onExpire,
}: {
  endsAt: string;
  onExpire?: () => void;
}) {
  const end = new Date(endsAt).getTime();
  const [left, setLeft] = useState(() => end - Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const remaining = end - Date.now();
      setLeft(remaining);
      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end, onExpire]);

  const urgent = left <= 60_000; // last minute

  return (
    <div>
      <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
      <p
        className={`text-3xl font-bold tabular-nums ${
          urgent ? "text-red-600" : "text-foreground"
        }`}
      >
        {format(left)}
      </p>
    </div>
  );
}
