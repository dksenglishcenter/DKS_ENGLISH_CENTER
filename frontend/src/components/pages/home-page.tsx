import { CTABanner } from "@/components/home/cta-banner";
import { CoursesSection } from "@/components/home/courses-section";
import { GallerySection } from "@/components/home/gallery-section";
import { Hero } from "@/components/home/hero";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import type { SetPage } from "@/lib/navigation";

export function HomePage({ setPage }: { setPage: SetPage }) {
  return (
    <>
      <Hero setPage={setPage} />
      <CoursesSection setPage={setPage} />
      <WhyChooseUs />
      <TestimonialsSection />
      <GallerySection />
      <CTABanner setPage={setPage} />
    </>
  );
}
