"use client";

import { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION = 1600;

const HERO_STATS = [
  { target: 2000, suffix: "+", label: "Học viên", decimals: 0 },
  { target: 95, suffix: "%", label: "Đạt mục tiêu", decimals: 0 },
  { target: 8, suffix: "+", label: "Năm kinh nghiệm", decimals: 0 },
  { target: 4.9, suffix: "★", label: "Đánh giá", decimals: 1 },
] as const;

const INTEGER_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

function formatValue(value: number, decimals: number) {
  return decimals === 0
    ? INTEGER_FORMATTER.format(Math.round(value))
    : value.toFixed(decimals);
}

export function AnimatedHeroStats() {
  const containerRef = useRef<HTMLDListElement>(null);
  const hasAnimatedRef = useRef(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrame = 0;

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setProgress(1);
        return;
      }

      const startedAt = performance.now();

      const update = (timestamp: number) => {
        const nextProgress = Math.min((timestamp - startedAt) / ANIMATION_DURATION, 1);
        setProgress(nextProgress);

        if (nextProgress < 1) {
          animationFrame = requestAnimationFrame(update);
        }
      };

      animationFrame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          startAnimation();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const easedProgress = 1 - (1 - progress) ** 3;

  return (
    <dl
      ref={containerRef}
      className="mt-12 flex flex-wrap gap-8 border-t border-border pt-8"
    >
      {HERO_STATS.map((stat) => {
        const precision = 10 ** stat.decimals;
        const animatedValue =
          Math.round(stat.target * easedProgress * precision) / precision;
        const finalValue = `${formatValue(stat.target, stat.decimals)}${stat.suffix}`;

        return (
          <div key={stat.label} className="flex flex-col">
            <dt className="order-2 text-sm font-medium text-muted-foreground">
              {stat.label}
            </dt>
            <dd
              className="order-1 text-2xl font-black tabular-nums text-primary font-[family-name:var(--font-nunito)]"
              aria-label={finalValue}
            >
              <span aria-hidden="true">
                {formatValue(animatedValue, stat.decimals)}
                {stat.suffix}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
