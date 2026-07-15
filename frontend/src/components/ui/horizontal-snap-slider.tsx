"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/components/ui/utils";

type HorizontalSnapSliderProps = {
  children: ReactNode;
  itemCount: number;
  /** Số card hiện đủ trên desktop trước khi hiện mũi tên. */
  desktopVisible?: number;
  prevLabel: string;
  nextLabel: string;
  className?: string;
  trackClassName?: string;
};

/**
 * Hàng scroll ngang + mũi tên desktop (giống featured courses trang chủ).
 * Tablet/mobile: lướt tay, ẩn nút.
 */
export function HorizontalSnapSlider({
  children,
  itemCount,
  desktopVisible = 4,
  prevLabel,
  nextLabel,
  className,
  trackClassName,
}: HorizontalSnapSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNav = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const onResize = () => updateNav();
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateNav, itemCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    return () => el.removeEventListener("scroll", updateNav);
  }, [updateNav, itemCount]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const gap = 24;
    const pageWidth = el.clientWidth + gap;
    el.scrollBy({ left: direction * pageWidth, behavior: "smooth" });
  };

  const showArrows = itemCount > desktopVisible;

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-primary shadow-md transition enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 lg:flex";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          trackClassName,
        )}
      >
        {children}
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            aria-label={prevLabel}
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className={`${arrowClass} left-0 -translate-x-1/2 sm:-translate-x-[calc(100%+0.5rem)]`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className={`${arrowClass} right-0 translate-x-1/2 sm:translate-x-[calc(100%+0.5rem)]`}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

/** Width 1 / 2 / 4 cột — khớp featured courses & teachers. */
export const SNAP_SLIDER_ITEM_CLASS =
  "w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";
