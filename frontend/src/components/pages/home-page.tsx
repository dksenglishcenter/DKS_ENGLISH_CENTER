import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";

import { FoxMascot } from "@/components/brand/fox-mascot";
import { AnimatedHeroStats } from "@/components/home/animated-hero-stats";
import { FeaturedCoursesSlider } from "@/components/home/featured-courses-slider";
import { HomeTestimonials } from "@/components/home/testimonials-section";
import { Container } from "@/components/layout/container";
import {
  FloatingAccentIcons,
  SectionHeading,
} from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { listCourses } from "@/lib/courses/api";
import { listGalleryImages } from "@/lib/gallery-images/api";
import type { GalleryImage } from "@/lib/gallery-images/types";
import { PAGE_PATHS } from "@/lib/navigation-paths";
import { listSuccessStories } from "@/lib/success-stories/api";
import type { SuccessStory } from "@/lib/success-stories/types";

const FEATURES = [
  {
    icon: Heart,
    title: "Giáo Viên Nhiệt Tâm",
    description:
      "Đội ngũ giáo viên tận tâm, yêu nghề, luôn đặt sự tiến bộ của học viên lên hàng đầu.",
    iconWrap: "rounded-2xl",
  },
  {
    icon: Lightbulb,
    title: "Phương Pháp Sáng Tạo",
    description:
      "Kết hợp phương pháp giảng dạy hiện đại với công nghệ AI, giúp học viên tiến bộ nhanh và vui vẻ.",
    iconWrap: "rounded-full",
  },
  {
    icon: GraduationCap,
    title: "Cam Kết Kết Quả",
    description:
      "Cam kết hoàn tiền nếu không đạt mục tiêu sau khóa học. Học viên là ưu tiên số một.",
    iconWrap: "rounded-xl",
  },
  {
    icon: Users,
    title: "Lớp Học Nhỏ",
    description:
      "Tối đa 12 học viên mỗi lớp, đảm bảo giáo viên chú ý và hỗ trợ từng em một cách hiệu quả.",
    iconWrap: "rounded-[1.75rem]",
  },
  {
    icon: Award,
    title: "Cơ Sở Hiện Đại",
    description:
      "Phòng học được trang bị màn hình tương tác, âm thanh chất lượng cao và không gian thoải mái.",
    iconWrap: "rounded-full",
  },
  {
    icon: Globe,
    title: "Kết Nối Toàn Cầu",
    description:
      "Tạo cơ hội giao lưu với học viên quốc tế, mở rộng mạng lưới và trải nghiệm văn hóa đa dạng.",
    iconWrap: "rounded-2xl rotate-3",
  },
] as const;

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
      <div
        className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-[30%] -translate-y-[30%] rounded-full opacity-20 dark:opacity-40"
        style={{ background: "var(--hero-glow-1)" }}
      />
      <div
        className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-[30%] translate-y-[30%] rounded-full opacity-15 dark:opacity-25"
        style={{ background: "var(--hero-glow-2)" }}
      />
      <FloatingAccentIcons
        className="hidden md:block"
        icons={[GraduationCap, BookOpen, Sparkles, Lightbulb]}
      />

      <Container className="relative py-20 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] md:gap-x-6 md:gap-y-8 lg:grid-cols-2 lg:gap-y-0">
          <div>
            <div
              className="mb-6 inline-flex animate-hero-enter items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm font-[family-name:var(--font-nunito)]"
              style={{ animationDelay: "0ms" }}
            >
              <GraduationCap className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              Hơn 2.000 học viên đã thay đổi cuộc đời
            </div>
            <h1
              className="mb-6 animate-hero-enter text-4xl font-black leading-[1.26] text-foreground font-[family-name:var(--font-nunito)] sm:text-5xl md:text-4xl md:leading-[1.22] lg:text-5xl xl:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              HỌC ĐÚNG CÁCH
              <br />
              <span className="text-primary">TIẾN XA</span>
              <br />
              MỖI NGÀY
            </h1>
            <p
              className="mb-8 max-w-md animate-hero-enter text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "200ms" }}
            >
              DKS English Center – nơi mỗi học viên được truyền cảm hứng, học đúng phương pháp và đạt mục tiêu tiếng Anh nhanh nhất có thể.
            </p>
            <div
              className="grid w-full animate-hero-enter grid-cols-2 gap-3 sm:w-auto sm:gap-4 md:flex md:flex-nowrap"
              style={{ animationDelay: "300ms" }}
            >
              <Button asChild size="lg" className="w-full whitespace-nowrap px-3 text-sm sm:px-8 sm:text-base">
                <Link href={PAGE_PATHS.contact}>
                  Đăng ký ngay <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full whitespace-nowrap px-3 text-sm sm:px-8 sm:text-base"
              >
                <Link href={PAGE_PATHS.contact}>Liên hệ tư vấn</Link>
              </Button>
            </div>
          </div>

          <div className="hidden items-center justify-center md:col-start-2 md:row-start-1 md:flex lg:row-span-2 lg:justify-end">
            <div
              className="relative h-[320px] w-[270px] animate-hero-enter lg:h-[400px] lg:w-[340px]"
              style={{ animationDelay: "200ms" }}
            >
              <div
                className="absolute inset-0 rounded-full opacity-30 dark:opacity-20"
                style={{ background: "var(--hero-glow-1)" }}
              />
              <div className="animate-fox-float">
                <FoxMascot />
              </div>
            </div>
          </div>

          <div
            className="animate-hero-enter md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-1"
            style={{ animationDelay: "400ms" }}
          >
            <AnimatedHeroStats />
          </div>
        </div>
      </Container>
    </section>
  );
}

async function CoursesSection() {
  let courses: Awaited<ReturnType<typeof listCourses>>["courses"] = [];
  try {
    const response = await listCourses({ featured: true });
    courses = response.courses;
  } catch {
    courses = [];
  }

  return (
    <section className="bg-card py-20 md:py-28" aria-labelledby="featured-courses-title">
      <Container>
        <Reveal>
          <SectionHeading
            icon={BookOpen}
            label="Khóa học nổi bật"
            title="Chương Trình Học Tại DKS"
            sub="Đa dạng khóa học phù hợp với mọi mục tiêu từ - luyện thi vào lớp 10, Đại học & THPT, IELTS 1:1 và Global Success lớp 1–9."
            titleId="featured-courses-title"
          />
        </Reveal>
        <Reveal delayMs={80}>
          <FeaturedCoursesSlider courses={courses} />
        </Reveal>
        <Reveal delayMs={120}>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href={PAGE_PATHS.courses}>
                Xem tất cả khóa học <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="bg-secondary py-20 md:py-28" aria-labelledby="why-dks-title">
      <Container>
        <Reveal>
          <SectionHeading
            icon={Sparkles}
            label="Tại sao chọn DKS?"
            title="Điều Làm Nên Sự Khác Biệt"
            sub="Chúng tôi không chỉ dạy tiếng Anh – chúng tôi xây dựng nền tảng để bạn tự tin chinh phục thế giới."
            titleId="why-dks-title"
          />
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delayMs={index * 60} as="article" className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
                  <span
                    className={`relative mb-5 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary shadow-[inset_0_0_0_1px] shadow-primary/20 ${feature.iconWrap}`}
                  >
                    <Icon
                      className="absolute h-9 w-9 fill-current opacity-[0.18]"
                      aria-hidden="true"
                    />
                    <Icon className="relative h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <h3 className="mb-3 text-lg font-black text-foreground font-[family-name:var(--font-nunito)]">
                    {feature.title}
                  </h3>
                  <p className="min-h-[4.5rem] flex-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function GallerySection({ photos }: { photos: GalleryImage[] }) {
  if (photos.length === 0) return null;

  const photoContent = (photo: GalleryImage, sizes: string) => (
    <CloudinaryGalleryImage
      src={photo.imageUrl}
      alt={photo.alt}
      sizes={sizes}
      objectPosition={photo.objectPosition}
    />
  );

  // Layout masonry giữ như thiết kế khi đủ 6 ảnh.
  if (photos.length >= 6) {
    const secondaryPhotos = [photos[1], photos[2]];
    const finalPhotos = [photos[4], photos[5]];

    return (
      <section className="bg-muted py-20 md:py-28" aria-labelledby="gallery-title">
        <Container>
          <Reveal>
            <SectionHeading
              icon={Camera}
              label="Hình ảnh học tập"
              title="Môi Trường Học Tập Tại DKS"
              sub="Không gian học tập hiện đại, thân thiện – nơi mỗi buổi học là một trải nghiệm thú vị."
              titleId="gallery-title"
            />
          </Reveal>
          <Reveal delayMs={80}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="group relative row-span-2 min-h-[420px] overflow-hidden rounded-2xl bg-secondary">
              {photoContent(photos[0], "(max-width: 767px) 50vw, 33vw")}
            </div>
            {secondaryPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative h-[200px] overflow-hidden rounded-2xl bg-secondary"
              >
                {photoContent(photo, "(max-width: 767px) 50vw, 33vw")}
              </div>
            ))}
            <div className="group relative col-span-2 h-[200px] overflow-hidden rounded-2xl bg-secondary">
              {photoContent(photos[3], "(max-width: 767px) 100vw, 66vw")}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {finalPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative h-[200px] overflow-hidden rounded-2xl bg-secondary"
              >
                {photoContent(photo, "50vw")}
              </div>
            ))}
          </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-muted py-20 md:py-28" aria-labelledby="gallery-title">
      <Container>
        <Reveal>
          <SectionHeading
            icon={Camera}
            label="Hình ảnh học tập"
            title="Môi Trường Học Tập Tại DKS"
            sub="Không gian học tập hiện đại, thân thiện – nơi mỗi buổi học là một trải nghiệm thú vị."
            titleId="gallery-title"
          />
        </Reveal>
        <Reveal delayMs={80}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative h-[200px] overflow-hidden rounded-2xl bg-secondary md:h-[240px]"
            >
              {photoContent(photo, "(max-width: 767px) 50vw, 33vw")}
            </div>
          ))}
        </div>
        </Reveal>
      </Container>
    </section>
  );
}

function CallToAction() {
  return (
    <section
      className="bg-gradient-to-br from-primary to-accent py-20 md:py-24"
      aria-labelledby="home-cta-title"
    >
      <Container>
        <Reveal>
          <div className="text-center text-primary-foreground">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 text-primary-foreground">
              <Rocket className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <h2
              id="home-cta-title"
              className="mb-4 text-3xl font-black font-[family-name:var(--font-nunito)] md:text-4xl"
            >
              Sẵn sàng bắt đầu hành trình của bạn?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
              Đăng ký học thử miễn phí ngay hôm nay – không cần cam kết, không phí ẩn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={PAGE_PATHS.contact}
                className="inline-flex min-h-12 w-full max-w-[268px] items-center justify-center whitespace-nowrap rounded-lg bg-card px-4 py-4 text-base font-bold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary font-[family-name:var(--font-nunito)] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
              >
                Đăng ký học thử miễn phí
              </Link>
              <Link
                href={PAGE_PATHS.courses}
                className="inline-flex min-h-12 w-full max-w-[268px] items-center justify-center whitespace-nowrap rounded-lg border-2 border-primary-foreground px-4 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary font-[family-name:var(--font-nunito)] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
              >
                Xem các khóa học
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export async function HomePage() {
  let stories: SuccessStory[] = [];
  let galleryPhotos: GalleryImage[] = [];

  try {
    const [storiesRes, galleryRes] = await Promise.all([
      listSuccessStories(),
      listGalleryImages(),
    ]);
    stories = storiesRes.stories;
    galleryPhotos = galleryRes.images;
  } catch {
    stories = [];
    galleryPhotos = [];
  }

  return (
    <>
      <Hero />
      <CoursesSection />
      <WhyChooseUs />
      <HomeTestimonials stories={stories} />
      <GallerySection photos={galleryPhotos} />
      <CallToAction />
    </>
  );
}
