import Link from "next/link";
import {
  ArrowRight,
  Award,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  Users,
} from "lucide-react";

import { FoxMascot } from "@/components/brand/fox-mascot";
import { AnimatedHeroStats } from "@/components/home/animated-hero-stats";
import { FeaturedCoursesSlider } from "@/components/home/featured-courses-slider";
import { HomeTestimonials } from "@/components/home/testimonials-section";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
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
  },
  {
    icon: Lightbulb,
    title: "Phương Pháp Sáng Tạo",
    description:
      "Kết hợp phương pháp giảng dạy hiện đại với công nghệ AI, giúp học viên tiến bộ nhanh và vui vẻ.",
  },
  {
    icon: GraduationCap,
    title: "Cam Kết Kết Quả",
    description:
      "Cam kết hoàn tiền nếu không đạt mục tiêu sau khóa học. Học viên là ưu tiên số một.",
  },
  {
    icon: Users,
    title: "Lớp Học Nhỏ",
    description:
      "Tối đa 12 học viên mỗi lớp, đảm bảo giáo viên chú ý và hỗ trợ từng em một cách hiệu quả.",
  },
  {
    icon: Award,
    title: "Cơ Sở Hiện Đại",
    description:
      "Phòng học được trang bị màn hình tương tác, âm thanh chất lượng cao và không gian thoải mái.",
  },
  {
    icon: Globe,
    title: "Kết Nối Toàn Cầu",
    description:
      "Tạo cơ hội giao lưu với học viên quốc tế, mở rộng mạng lưới và trải nghiệm văn hóa đa dạng.",
  },
] as const;

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFF4EC_0%,#FFFBF0_50%,#FFF0E8_100%)]">
      <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-[30%] -translate-y-[30%] rounded-full bg-[radial-gradient(circle,#FFA200_0%,transparent_70%)] opacity-20" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-[30%] translate-y-[30%] rounded-full bg-[radial-gradient(circle,#F16522_0%,transparent_70%)] opacity-15" />

      <Container className="relative py-20 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 items-center gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] md:gap-x-6 md:gap-y-8 lg:grid-cols-2 lg:gap-y-0">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm font-[family-name:var(--font-nunito)]">
              <span aria-hidden="true">🎓</span> Hơn 2.000 học viên đã thay đổi cuộc đời
            </div>
            <h1 className="mb-6 text-4xl font-black leading-[1.15] text-[#4A2306] font-[family-name:var(--font-nunito)] sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
              HỌC ĐÚNG CÁCH
              <br />
              <span className="text-primary">TIẾN XA</span>
              <br />
              MỖI NGÀY
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-[#6B3E26]">
              DKS English Center – nơi mỗi học viên được truyền cảm hứng, học đúng phương pháp và đạt mục tiêu tiếng Anh nhanh nhất có thể.
            </p>
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:gap-4 md:flex md:flex-nowrap">
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
            <div className="relative h-[320px] w-[270px] lg:h-[400px] lg:w-[340px]">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#FFA200_0%,transparent_70%)] opacity-30" />
              <FoxMascot />
            </div>
          </div>

          <div className="md:col-span-2 md:row-start-2 lg:col-span-1 lg:col-start-1">
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
    <section className="bg-white py-20 md:py-28" aria-labelledby="featured-courses-title">
      <Container>
        <SectionHeading
          label="Khóa học nổi bật"
          title="Chương Trình Học Tại DKS"
          sub="Đa dạng khóa học phù hợp với mọi mục tiêu từ - luyện thi vào lớp 10, Đại học & THPT, IELTS 1:1 và Global Success lớp 1–9."
          titleId="featured-courses-title"
        />
        <FeaturedCoursesSlider courses={courses} />
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href={PAGE_PATHS.courses}>
              Xem tất cả khóa học <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="bg-secondary py-20 md:py-28" aria-labelledby="why-dks-title">
      <Container>
        <SectionHeading
          label="Tại sao chọn DKS?"
          title="Điều Làm Nên Sự Khác Biệt"
          sub="Chúng tôi không chỉ dạy tiếng Anh – chúng tôi xây dựng nền tảng để bạn tự tin chinh phục thế giới."
          titleId="why-dks-title"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mb-3 text-lg font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
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
          <SectionHeading
            label="Hình ảnh học tập"
            title="Môi Trường Học Tập Tại DKS"
            sub="Không gian học tập hiện đại, thân thiện – nơi mỗi buổi học là một trải nghiệm thú vị."
            titleId="gallery-title"
          />
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
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-muted py-20 md:py-28" aria-labelledby="gallery-title">
      <Container>
        <SectionHeading
          label="Hình ảnh học tập"
          title="Môi Trường Học Tập Tại DKS"
          sub="Không gian học tập hiện đại, thân thiện – nơi mỗi buổi học là một trải nghiệm thú vị."
          titleId="gallery-title"
        />
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
      </Container>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-[linear-gradient(135deg,#F16522_0%,#FFA200_100%)] py-20 md:py-24" aria-labelledby="home-cta-title">
      <Container>
        <div className="text-center text-white">
          <div className="mb-4 text-4xl" aria-hidden="true">🚀</div>
          <h2 id="home-cta-title" className="mb-4 text-3xl font-black font-[family-name:var(--font-nunito)] md:text-4xl">
            Sẵn sàng bắt đầu hành trình của bạn?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-orange-50">
            Đăng ký học thử miễn phí ngay hôm nay – không cần cam kết, không phí ẩn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={PAGE_PATHS.contact}
              className="inline-flex min-h-12 w-full max-w-[268px] items-center justify-center whitespace-nowrap rounded-lg bg-white px-4 py-4 text-base font-bold text-primary transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary font-[family-name:var(--font-nunito)] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
            >
              Đăng ký học thử miễn phí
            </Link>
            <Link
              href={PAGE_PATHS.courses}
              className="inline-flex min-h-12 w-full max-w-[268px] items-center justify-center whitespace-nowrap rounded-lg border-2 border-white px-4 py-4 text-base font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary font-[family-name:var(--font-nunito)] sm:w-auto sm:max-w-none sm:px-8 sm:text-lg"
            >
              Xem các khóa học
            </Link>
          </div>
        </div>
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
