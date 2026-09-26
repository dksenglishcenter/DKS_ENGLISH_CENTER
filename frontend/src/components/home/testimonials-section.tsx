"use client";

import { Heart } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { CourseCoverImage } from "@/components/media/course-cover-image";
import { Reveal } from "@/components/motion/reveal";
import type { SuccessStory } from "@/lib/success-stories/types";

type HomeTestimonialsProps = {
  stories: SuccessStory[];
};

export function HomeTestimonials({ stories }: HomeTestimonialsProps) {
  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="bg-card py-20 md:py-28" aria-labelledby="testimonials-title">
      <Container>
        <Reveal>
          <SectionHeading
            icon={Heart}
            label="Khoảnh khắc & cảm nhận"
            title="Học viên thích học ở DKS"
            sub="Ảnh thật và lời nhắn ngắn từ lớp — thành công cũng là khi các bé thích đến học."
            titleId="testimonials-title"
          />
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {stories.map((story, index) => (
            <Reveal key={story.id} delayMs={Math.min(index, 5) * 50} as="li">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  {story.imageUrl ? (
                    <CourseCoverImage
                      src={story.imageUrl}
                      alt={`${story.name} — ${story.course}`}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "var(--hero-gradient)" }}
                    >
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground font-[family-name:var(--font-nunito)]">
                        {story.avatar}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 via-foreground/25 to-transparent p-4 pt-16">
                    <p className="text-sm font-semibold leading-snug text-white md:text-[0.95rem]">
                      “{story.text}”
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="text-sm font-black text-foreground font-[family-name:var(--font-nunito)]">
                    {story.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{story.course}</p>
                  {story.badge ? (
                    <p className="mt-auto pt-2 text-xs font-semibold text-primary font-[family-name:var(--font-nunito)]">
                      {story.badge}
                    </p>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
