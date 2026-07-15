"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Target } from "lucide-react";

import { CourseCoverImage } from "@/components/media/course-cover-image";
import type { Course } from "@/lib/courses/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";

type FeaturedCoursesSliderProps = {
  courses: Course[];
};

const DESKTOP_VISIBLE = 4;

export function FeaturedCoursesSlider({ courses }: FeaturedCoursesSliderProps) {
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
  }, [updateNav, courses.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    return () => el.removeEventListener("scroll", updateNav);
  }, [updateNav, courses.length]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const gap = 24;
    const pageWidth = el.clientWidth + gap;
    el.scrollBy({ left: direction * pageWidth, behavior: "smooth" });
  };

  // Chỉ desktop (lg+): tablet/mobile lướt tay, không cần nút.
  const showArrows = courses.length > DESKTOP_VISIBLE;

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có khóa học nổi bật.</p>
    );
  }

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-primary shadow-md transition enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30 lg:flex";

  return (
    <div className="relative">
      {/* Hàng card full-width như cũ — mũi tên treo ngoài, không chiếm chỗ */}
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((course, index) => (
          <Link
            key={course.id}
            href={`${PAGE_PATHS.courses}#${course.slug}`}
            className="group flex w-full shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
          >
            <div
              className="relative h-40 shrink-0 overflow-hidden"
              style={{ background: course.bg }}
            >
              <CourseCoverImage
                src={course.coverImageUrl}
                alt={course.subtitle}
                priority={index === 0}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                className="opacity-60 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${course.accent}CC, transparent)` }}
              />
              <span className="absolute left-3 top-3 text-3xl" aria-hidden="true">
                {course.icon}
              </span>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm font-[family-name:var(--font-nunito)]">
                  {course.level}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-1 text-base font-black text-[#4A2306] font-[family-name:var(--font-nunito)] sm:min-h-6">
                {course.title}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground sm:min-h-8">{course.subtitle}</p>
              <div className="mb-3 flex items-start gap-1 sm:min-h-4">
                <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-primary">{course.target}</span>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3">
                <span className="text-sm font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                  {course.tuition}
                </span>
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary">
                  <ArrowRight
                    className="h-3.5 w-3.5 text-primary transition-colors group-hover:text-white"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showArrows ? (
        <>
          <button
            type="button"
            aria-label="Khóa học trước"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className={`${arrowClass} left-0 -translate-x-1/2 sm:-translate-x-[calc(100%+0.5rem)]`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Khóa học tiếp"
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
