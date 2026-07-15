"use client";

import Image from "next/image";

import {
  HorizontalSnapSlider,
  SNAP_SLIDER_ITEM_CLASS,
} from "@/components/ui/horizontal-snap-slider";
import type { Teacher } from "@/lib/teachers/types";

type TeachersSliderProps = {
  teachers: Teacher[];
};

export function TeachersSlider({ teachers }: TeachersSliderProps) {
  if (teachers.length === 0) {
    return (
      <p className="mb-24 text-sm text-muted-foreground">Chưa có giáo viên.</p>
    );
  }

  return (
    <div className="mb-24">
      <HorizontalSnapSlider
        itemCount={teachers.length}
        prevLabel="Giáo viên trước"
        nextLabel="Giáo viên tiếp"
      >
        {teachers.map((t) => (
          <div
            key={t.id}
            className={`group overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${SNAP_SLIDER_ITEM_CLASS}`}
          >
            <div className="relative h-52 overflow-hidden bg-secondary">
              <Image
                src={t.imageUrl}
                alt={t.name}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A2306]/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white font-[family-name:var(--font-nunito)]">
                  {t.exp}
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="mb-1 font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                {t.name}
              </h3>
              <div className="mb-2 text-xs font-semibold text-primary font-[family-name:var(--font-body)]">
                {t.title}
              </div>
              <div className="mb-3 text-xs font-medium text-muted-foreground font-[family-name:var(--font-body)]">
                {t.cred}
              </div>
              <p className="text-justify text-xs leading-relaxed text-muted-foreground font-[family-name:var(--font-body)]">
                {t.bio}
              </p>
            </div>
          </div>
        ))}
      </HorizontalSnapSlider>
    </div>
  );
}
