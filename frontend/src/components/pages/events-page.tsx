import { CalendarDays, Camera, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading } from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
import { CourseCoverImage } from "@/components/media/course-cover-image";
import { Reveal } from "@/components/motion/reveal";
import type { EventItem } from "@/lib/events/types";
import type { EventPhoto } from "@/lib/event-photos/types";

type EventsPageProps = {
  events: EventItem[];
  photos: EventPhoto[];
};

function parseEventDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isUpcoming(date: Date | null) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

function EventDateBadge({ date }: { date: Date }) {
  const day = date.getDate();
  const month = date.toLocaleDateString("vi-VN", { month: "short" }).replace(".", "");
  const year = date.getFullYear();

  return (
    <div
      className="flex h-full min-h-[5.5rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-secondary text-center ring-1 ring-border sm:w-[5.25rem]"
      aria-hidden="true"
    >
      <span className="text-[1.75rem] font-black leading-none text-primary font-[family-name:var(--font-nunito)]">
        {day}
      </span>
      <span className="mt-1 text-[0.7rem] font-bold uppercase tracking-wide text-foreground font-[family-name:var(--font-nunito)]">
        {month}
      </span>
      <span className="text-[0.65rem] font-semibold text-muted-foreground">{year}</span>
    </div>
  );
}

function EventCard({
  event,
  coverFallback,
  featured = false,
  delayMs = 0,
}: {
  event: EventItem;
  coverFallback?: string | null;
  featured?: boolean;
  delayMs?: number;
}) {
  const date = parseEventDate(event.eventDate);
  const upcoming = isUpcoming(date);
  const cover = event.coverImageUrl || coverFallback || null;
  const dateLabel = date
    ? date.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (featured) {
    return (
      <Reveal delayMs={delayMs} as="li" className="md:col-span-2">
        <article className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="relative min-h-[220px] overflow-hidden bg-secondary md:min-h-[280px]">
              {cover ? (
                <CourseCoverImage
                  src={cover}
                  alt={event.title}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                />
              ) : (
                <div
                  className="absolute inset-0 opacity-90"
                  style={{ background: "var(--hero-gradient)" }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card/40" />
              {date ? (
                <div className="absolute left-4 top-4 md:left-5 md:top-5">
                  <EventDateBadge date={date} />
                </div>
              ) : null}
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={
                    upcoming
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground font-[family-name:var(--font-nunito)]"
                      : "rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground font-[family-name:var(--font-nunito)]"
                  }
                >
                  {upcoming ? "Sắp diễn ra" : "Đã diễn ra"}
                </span>
                {dateLabel ? (
                  <time
                    dateTime={event.eventDate ?? undefined}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                    {dateLabel}
                  </time>
                ) : null}
              </div>

              <h3 className="mb-3 text-2xl font-black leading-tight text-foreground md:text-3xl font-[family-name:var(--font-nunito)]">
                {event.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {event.summary}
              </p>
              {event.body ? (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/75">
                  {event.body}
                </p>
              ) : null}
              <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary/80 font-[family-name:var(--font-nunito)]">
                <MapPin className="size-3.5" aria-hidden />
                DKS English Center
              </p>
            </div>
          </div>
        </article>
      </Reveal>
    );
  }

  return (
    <Reveal delayMs={delayMs} as="li">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none">
        <div className="relative h-40 overflow-hidden bg-secondary sm:h-44">
          {cover ? (
            <CourseCoverImage
              src={cover}
              alt={event.title}
              sizes="(max-width: 767px) 100vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "var(--hero-gradient)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          {date ? (
            <div className="absolute left-3 top-3">
              <EventDateBadge date={date} />
            </div>
          ) : null}
          <span
            className={
              upcoming
                ? "absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold text-primary-foreground font-[family-name:var(--font-nunito)]"
                : "absolute right-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[0.65rem] font-bold text-muted-foreground backdrop-blur-sm font-[family-name:var(--font-nunito)]"
            }
          >
            {upcoming ? "Sắp tới" : "Đã qua"}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {dateLabel ? (
            <time
              dateTime={event.eventDate ?? undefined}
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-primary font-[family-name:var(--font-nunito)]"
            >
              {dateLabel}
            </time>
          ) : null}
          <h3 className="mb-2 line-clamp-2 text-lg font-black leading-snug text-foreground font-[family-name:var(--font-nunito)]">
            {event.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {event.summary}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export function EventsPage({ events, photos }: EventsPageProps) {
  const sorted = [...events].sort((a, b) => {
    const da = parseEventDate(a.eventDate)?.getTime() ?? 0;
    const db = parseEventDate(b.eventDate)?.getTime() ?? 0;
    return db - da;
  });

  const [featured, ...rest] = sorted;

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        icon={CalendarDays}
        label="Sự kiện DKS"
        title="Hoạt động & khoảnh khắc"
        description="Thông báo sự kiện sắp tới và lưu trữ hình ảnh hoạt động tại trung tâm — học tập, giao lưu, ngày hội."
      />

      <section className="bg-card py-16 md:py-20" aria-labelledby="events-list-title">
        <Container>
          <Reveal>
            <SectionHeading
              icon={CalendarDays}
              label="Thông báo"
              title="Sự kiện tại DKS"
              sub="Các hoạt động sắp diễn ra và đã tổ chức tại trung tâm."
              titleId="events-list-title"
            />
          </Reveal>

          {sorted.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Chưa có thông báo sự kiện. Vui lòng quay lại sau.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-7">
              {featured ? (
                <EventCard
                  key={featured.id}
                  event={featured}
                  featured
                  coverFallback={photos[0]?.imageUrl}
                  delayMs={0}
                />
              ) : null}
              {rest.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  coverFallback={photos[(index + 1) % Math.max(photos.length, 1)]?.imageUrl}
                  delayMs={Math.min(index + 1, 5) * 45}
                />
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="bg-muted py-16 md:py-24" aria-labelledby="events-gallery-title">
        <Container>
          <Reveal>
            <SectionHeading
              icon={Camera}
              label="Lưu trữ hình ảnh"
              title="Khoảnh khắc tại DKS"
              sub="Ảnh học tập, giao lưu và các sự kiện đã diễn ra tại trung tâm."
              titleId="events-gallery-title"
            />
          </Reveal>

          {photos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Hình ảnh sự kiện sẽ được cập nhật sớm.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {photos.map((photo, index) => (
                <Reveal key={photo.id} delayMs={Math.min(index, 6) * 40}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary ring-1 ring-border/60">
                    <CloudinaryGalleryImage
                      src={photo.imageUrl}
                      alt={photo.alt}
                      sizes="(max-width: 767px) 50vw, 33vw"
                      objectPosition={photo.objectPosition}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
