"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Clock,
  Target,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CourseCoverImage } from "@/components/media/course-cover-image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listCourses } from "@/lib/courses/api";
import type { Course } from "@/lib/courses/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "grade-10", label: "Thi vào lớp 10" },
  { id: "thpt-university", label: "THPT & Đại học" },
  { id: "ielts", label: "IELTS" },
  { id: "global-success", label: "Global Success" },
] as const;

export function CoursesPage() {
  const [active, setActive] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        title="Chọn Khóa Học Phù Hợp"
        description="Các chương trình trọng tâm từ tiếng Anh lớp 1–9 đến luyện thi vào lớp 10, THPT, Đại học và IELTS."
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

              <div
                className="mt-8 rounded-xl bg-secondary p-4"
              >
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

          <div className="flex-1">
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải khóa học...</p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {!loading && !error && filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có khóa học phù hợp.</p>
            ) : null}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((course, index) => (
                <Reveal key={course.id} delayMs={Math.min(index, 5) * 50}>
                <article
                  id={course.slug}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-xl"
                >
                  <div
                    className="relative h-48 shrink-0 overflow-hidden"
                    style={{ background: course.bg }}
                  >
                    <CourseCoverImage
                      src={course.coverImageUrl}
                      alt={course.subtitle}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="opacity-70 transition-transform duration-500 hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${course.accent}BB 0%, transparent 60%)`,
                      }}
                    />
                    <div className="absolute left-4 top-4 text-4xl">{course.icon}</div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <div className="text-lg font-black text-white font-[family-name:var(--font-nunito)]">
                          {course.title}
                        </div>
                        <div className="text-sm text-white/80 font-[family-name:var(--font-body)]">
                          {course.subtitle}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-5 text-sm leading-relaxed text-muted-foreground font-[family-name:var(--font-body)] md:min-h-[4.2rem]">
                      {course.description}
                    </p>

                    <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                      {[
                        {
                          icon: <BookOpen className="h-3.5 w-3.5" />,
                          label: "Trình độ",
                          val: course.level,
                        },
                        {
                          icon: <Target className="h-3.5 w-3.5" />,
                          label: "Mục tiêu",
                          val: course.target,
                        },
                        {
                          icon: <Clock className="h-3.5 w-3.5" />,
                          label: "Thời gian",
                          val: course.duration,
                        },
                        {
                          icon: <Award className="h-3.5 w-3.5" />,
                          label: "Học phí",
                          val: course.tuition,
                        },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-secondary p-2.5">
                          <div className="mb-0.5 flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-primary">{item.icon}</span>
                            <span className="text-xs font-[family-name:var(--font-body)]">
                              {item.label}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-foreground font-[family-name:var(--font-body)]">
                            {item.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-5">
                      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground font-[family-name:var(--font-nunito)]">
                        Điểm nổi bật
                      </div>
                      <ul className="space-y-1.5">
                        {course.perks.map((perk) => (
                          <li
                            key={perk}
                            className="flex items-center gap-2 text-sm text-foreground font-[family-name:var(--font-body)]"
                          >
                            <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button asChild className="mt-auto w-full justify-center">
                      <Link href={PAGE_PATHS.contact}>
                        Nhận tư vấn miễn phí <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
