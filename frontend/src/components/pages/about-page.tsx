import Image from "next/image";
import {
  Building2,
  Handshake,
  Heart,
  Lightbulb,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import { TeachersSlider } from "@/components/about/teachers-slider";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading, SectionLabel } from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
import { Reveal } from "@/components/motion/reveal";
import { getAboutContent } from "@/lib/about-content/api";
import { listFacilityImages } from "@/lib/facility-images/api";
import type { FacilityImage } from "@/lib/facility-images/types";
import { listTeachers } from "@/lib/teachers/api";
import type { Teacher } from "@/lib/teachers/types";

export async function AboutPage() {
  let visionImageUrl: string | null = null;
  let facilities: FacilityImage[] = [];
  let teachers: Teacher[] = [];

  try {
    const [aboutRes, facilitiesRes, teachersRes] = await Promise.all([
      getAboutContent(),
      listFacilityImages(),
      listTeachers(),
    ]);
    if (aboutRes.content.visionImageUrl) {
      visionImageUrl = aboutRes.content.visionImageUrl;
    }
    facilities = facilitiesRes.images;
    teachers = teachersRes.teachers;
  } catch {
    // keep empty fallbacks
  }

  const values = [
    {
      icon: Heart,
      title: "Tận Tâm",
      desc: "Mỗi học viên là một cá nhân đặc biệt. Chúng tôi cam kết đồng hành tận tâm trong suốt hành trình học tập.",
      wrap: "rounded-2xl",
    },
    {
      icon: Lightbulb,
      title: "Sáng Tạo",
      desc: "Không ngừng đổi mới phương pháp, ứng dụng công nghệ để mang lại trải nghiệm học tập tốt nhất.",
      wrap: "rounded-full",
    },
    {
      icon: Sparkles,
      title: "Chất Lượng",
      desc: "Cam kết chất lượng giảng dạy cao nhất, với giáo viên được đào tạo bài bản và kiểm duyệt nghiêm ngặt.",
      wrap: "rounded-xl",
    },
    {
      icon: Handshake,
      title: "Đồng Hành",
      desc: "DKS không chỉ là trung tâm – là người bạn đồng hành đáng tin cậy trên con đường chinh phục tiếng Anh.",
      wrap: "rounded-[1.5rem]",
    },
  ] as const;

  return (
    <div className="bg-background">
      <PageHero
        icon={Building2}
        label="Về DKS"
        title="Câu Chuyện Của Chúng Tôi"
        description="Hơn 8 năm đồng hành cùng học viên Việt Nam trên con đường chinh phục tiếng Anh và mở ra thế giới."
      />

      <Container className="py-20">
        <Reveal>
          <div className="mb-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionLabel icon={Target}>Tầm nhìn & Sứ mệnh</SectionLabel>
              <h2 className="mb-6 text-3xl font-black text-foreground font-[family-name:var(--font-nunito)] md:text-4xl">
                Chúng Tôi Tin Rằng
                <br />
                Mọi Người Đều Có Thể
              </h2>
              <div className="space-y-6 font-[family-name:var(--font-body)]">
                <div className="flex gap-4">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Target className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold text-foreground font-[family-name:var(--font-nunito)]">
                      Tầm nhìn
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Trở thành trung tâm tiếng Anh hàng đầu Việt Nam, nơi mỗi học viên tìm được phương
                      pháp học phù hợp và đạt mục tiêu một cách vui vẻ, bền vững.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Lightbulb className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold text-foreground font-[family-name:var(--font-nunito)]">
                      Sứ mệnh
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Cung cấp nền giáo dục tiếng Anh chất lượng cao, sáng tạo và cá nhân hóa – giúp học
                      viên không chỉ học tốt tiếng Anh mà còn yêu thích ngôn ngữ này.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-muted">
                {visionImageUrl ? (
                  <Image
                    src={visionImageUrl}
                    alt="DKS English Center"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-body)]">
                      DKS English Center
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="text-3xl font-black text-primary font-[family-name:var(--font-nunito)]">
                  8+
                </div>
                <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
                  Năm kinh nghiệm
                </div>
              </div>
              <div className="absolute -top-5 -right-5 rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="text-3xl font-black text-accent font-[family-name:var(--font-nunito)]">
                  2K+
                </div>
                <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
                  Học viên
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading icon={Sparkles} label="Giá trị cốt lõi" title="Những Gì DKS Tin Tưởng" />
        </Reveal>
        <div className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, index) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.title} delayMs={index * 60}>
                <div className="flex h-full flex-col rounded-2xl bg-secondary p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none">
                  <span
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary shadow-[inset_0_0_0_1px] shadow-primary/20 ${v.wrap}`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <h3 className="mb-2 font-black text-foreground font-[family-name:var(--font-nunito)]">
                    {v.title}
                  </h3>
                  <p className="min-h-[4.5rem] flex-1 text-sm leading-relaxed text-muted-foreground font-[family-name:var(--font-body)]">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <SectionHeading
            icon={Users}
            label="Đội ngũ giáo viên"
            title="Những Người Thầy Tận Tâm"
            sub="Giáo viên DKS không chỉ giỏi chuyên môn mà còn đam mê giảng dạy, luôn lấy học viên làm trung tâm."
          />
        </Reveal>
        <Reveal delayMs={80}>
          <TeachersSlider teachers={teachers} />
        </Reveal>

        <Reveal>
          <SectionHeading icon={Building2} label="Cơ sở vật chất" title="Không Gian Học Tập Lý Tưởng" />
        </Reveal>
        <Reveal delayMs={80}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="group relative h-[200px] overflow-hidden rounded-2xl bg-secondary"
              >
                <CloudinaryGalleryImage
                  src={facility.imageUrl}
                  alt={facility.title}
                  sizes="(max-width: 767px) 50vw, 33vw"
                  objectPosition="center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-sm font-bold text-white font-[family-name:var(--font-nunito)]">
                    {facility.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
