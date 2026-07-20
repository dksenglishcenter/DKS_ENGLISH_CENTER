"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

import { CourseCoverImage } from "@/components/media/course-cover-image";
import {
  HorizontalSnapSlider,
  SNAP_SLIDER_ITEM_CLASS,
} from "@/components/ui/horizontal-snap-slider";
import type { Course } from "@/lib/courses/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";

type FeaturedCoursesSliderProps = {
  courses: Course[];
};

export function FeaturedCoursesSlider({ courses }: FeaturedCoursesSliderProps) {
  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có khóa học nổi bật.</p>
    );
  }

  return (
    <HorizontalSnapSlider
      itemCount={courses.length}
      prevLabel="Khóa học trước"
      nextLabel="Khóa học tiếp"
    >
      {courses.map((course, index) => (
        <Link
          key={course.id}
          href={`${PAGE_PATHS.courses}#${course.slug}`}
          className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none ${SNAP_SLIDER_ITEM_CLASS}`}
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
            <h3 className="mb-1 text-base font-black text-foreground font-[family-name:var(--font-nunito)] sm:min-h-6">
              {course.title}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground sm:min-h-8">{course.subtitle}</p>
            <div className="mb-3 flex items-start gap-1 sm:min-h-4">
              <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold text-primary">{course.target}</span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3">
              <span className="text-sm font-black text-foreground font-[family-name:var(--font-nunito)]">
                {course.tuition}
              </span>
              <span className="hidden h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary lg:flex">
                <ArrowRight
                  className="h-3.5 w-3.5 text-primary transition-colors group-hover:text-white"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </HorizontalSnapSlider>
  );
}
