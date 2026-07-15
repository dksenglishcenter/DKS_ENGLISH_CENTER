"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { StarRow } from "@/components/media/star-row";
import type { SuccessStory } from "@/lib/success-stories/types";

type HomeTestimonialsProps = {
  stories: SuccessStory[];
};

export function HomeTestimonials({ stories }: HomeTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (stories.length === 0) {
    return null;
  }

  const safeIndex = Math.min(activeIndex, stories.length - 1);
  const testimonial = stories[safeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? stories.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % stories.length);
  };

  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby="testimonials-title">
      <Container>
        <SectionHeading
          label="Học viên nói gì?"
          title="Câu Chuyện Thành Công"
          sub="Hàng nghìn học viên đã thay đổi cuộc đời với DKS. Đây là một vài câu chuyện truyền cảm hứng."
          titleId="testimonials-title"
        />

        <div className="mx-auto max-w-3xl">
          <article
            className="relative rounded-2xl bg-secondary p-8 md:p-12"
            aria-live="polite"
          >
            <span
              className="absolute left-8 top-6 text-6xl font-black text-primary/20 font-[family-name:var(--font-nunito)]"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <StarRow count={testimonial.stars} />
            <p className="relative z-10 my-6 text-lg leading-relaxed text-[#4A2306] md:text-xl">
              {testimonial.text}
            </p>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-row sm:gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-black text-white font-[family-name:var(--font-nunito)]">
                {testimonial.avatar}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#4A2306] font-[family-name:var(--font-nunito)] sm:text-base">
                  {testimonial.name}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">{testimonial.course}</p>
              </div>
              <div className="sm:ml-auto">
                <span className="inline-flex max-w-32 items-center justify-center gap-1 rounded-full bg-primary px-3 py-1.5 text-center text-[10px] font-bold leading-tight text-white font-[family-name:var(--font-nunito)] sm:max-w-none sm:gap-1.5 sm:px-4 sm:text-xs sm:leading-normal">
                  <span aria-hidden="true">🏆</span> {testimonial.badge}
                </span>
              </div>
            </div>
          </article>

          {stories.length > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={showPrevious}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Xem cảm nhận trước"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {stories.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    index === safeIndex
                      ? "h-3 w-8 bg-primary"
                      : "h-3 w-3 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`Xem cảm nhận ${index + 1}`}
                  aria-current={index === safeIndex ? "true" : undefined}
                />
              ))}
              <button
                type="button"
                onClick={showNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Xem cảm nhận tiếp theo"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
