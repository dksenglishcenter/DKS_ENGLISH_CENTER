"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Clock,
  Route,
  Target,
} from "lucide-react";

import { CourseRoadmapChart } from "@/components/courses/course-roadmap-chart";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CourseCoverImage } from "@/components/media/course-cover-image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listCourses } from "@/lib/courses/api";
import type { Course, CourseRoadmap } from "@/lib/courses/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pre-primary", label: "Tiền tiểu học" },
  { id: "global-success", label: "Global Success" },
  { id: "grade-10", label: "Thi vào lớp 10" },
  { id: "thpt-university", label: "THPT & đại học" },
  { id: "communicative", label: "Người đi làm" },
  { id: "toeic", label: "TOEIC" },
  { id: "ielts", label: "IELTS" },
] as const;

function parseRoadmap(value: Course["roadmap"]): CourseRoadmap | null {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value.stages) || value.stages.length === 0) return null;
  return value;
}

export function CoursesPage() {
  const [active, setActive] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await listCourses();
        if (!cancelled) setCourses(response.courses);
      } catch (err) {
        if (!cancelled) {
          setCourses([]);
          setError(err instanceof Error ? err.message : "Không tải được khóa học");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    active === "all" ? courses : courses.filter((course) => course.category === active);

  return (
    <div className="bg-background min-h-screen">
      <PageHero
        icon={BookOpen}
        label="Khóa học DKS"
        title="Chọn khóa học phù hợp"
        description="Từ tiền tiểu học, Global Success, luyện thi, giao tiếp người đi làm đến TOEIC & IELTS — mỗi khóa có lộ trình và giáo trình rõ ràng."
      />

      <Container className="py-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 font-black text-foreground font-[family-name:var(--font-nunito)]">
                Lọc theo loại
              </h3>
              <div className="flex flex-col gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                      active === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-secondary p-4">
                <div className="mb-2 text-2xl">🤔</div>
                <p className="mb-3 text-sm font-semibold text-foreground font-[family-name:var(--font-nunito)]">
                  Chưa biết chọn khóa nào?
                </p>
                <Button asChild size="sm" className="w-full justify-center text-xs">
                  <Link href={PAGE_PATHS.contact}>Tư vấn miễn phí</Link>
                </Button>
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải khóa học...</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {!loading && !error && filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có khóa học phù hợp.</p>
            ) : null}

            {filtered.map((course, index) => {
              const roadmap = parseRoadmap(course.roadmap);
              const isOpen = expanded === course.id || expanded === course.slug;
              const curriculum = course.curriculum ?? [];

              return (
                <Reveal key={course.id} delayMs={Math.min(index, 5) * 40}>
                  <article
                    id={course.slug}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <div
                        className="relative min-h-[200px] overflow-hidden md:min-h-full"
                        style={{ background: course.bg }}
                      >
                        <CourseCoverImage
                          src={course.coverImageUrl}
                          alt={course.subtitle}
                          sizes="(max-width: 767px) 100vw, 40vw"
                          className="opacity-75"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to top, ${course.accent}CC 0%, transparent 55%)`,
                          }}
                        />
                        <div className="absolute left-4 top-4 text-4xl">{course.icon}</div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h2 className="text-xl font-black text-white font-[family-name:var(--font-nunito)] md:text-2xl">
                            {course.title}
                          </h2>
                          <p className="text-sm text-white/85">{course.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex flex-col p-5 md:p-6">
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {course.description}
                        </p>

                        <div className="mb-4 grid grid-cols-2 gap-2.5 text-sm">
                          {[
                            { icon: BookOpen, label: "Trình độ", val: course.level },
                            { icon: Target, label: "Mục tiêu", val: course.target },
                            { icon: Clock, label: "Thời gian", val: course.duration },
                            { icon: Award, label: "Học phí", val: course.tuition },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg bg-secondary p-2.5">
                              <div className="mb-0.5 flex items-center gap-1.5 text-muted-foreground">
                                <item.icon className="h-3.5 w-3.5 text-accent" />
                                <span className="text-xs">{item.label}</span>
                              </div>
                              <div className="text-xs font-semibold text-foreground">
                                {item.val}
                              </div>
                            </div>
                          ))}
                        </div>

                        <ul className="mb-4 space-y-1.5">
                          {course.perks.slice(0, 4).map((perk) => (
                            <li
                              key={perk}
                              className="flex items-start gap-2 text-sm text-foreground"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              {perk}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto flex flex-wrap gap-2">
                          {(roadmap || curriculum.length > 0) && (
                            <Button
                              type="button"
                              variant="outline"
                              className="justify-center"
                              onClick={() =>
                                setExpanded(isOpen ? null : course.id)
                              }
                            >
                              <Route className="h-4 w-4" />
                              {isOpen ? "Thu gọn lộ trình" : "Xem lộ trình & giáo trình"}
                            </Button>
                          )}
                          <Button asChild className="justify-center">
                            <Link href={PAGE_PATHS.contact}>
                              Nhận tư vấn <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="border-t border-border bg-secondary/40 px-5 py-6 md:px-8">
                        {roadmap ? (
                          <div className="mb-8">
                            <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-foreground font-[family-name:var(--font-nunito)]">
                              Lộ trình học
                            </h3>
                            <CourseRoadmapChart
                              roadmap={roadmap}
                              accent={course.accent}
                            />
                          </div>
                        ) : null}

                        {curriculum.length > 0 ? (
                          <div>
                            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-foreground font-[family-name:var(--font-nunito)]">
                              Giáo trình sơ lược
                            </h3>
                            <ul className="grid gap-2 sm:grid-cols-2">
                              {curriculum.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground"
                                >
                                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
