import Image from "next/image";

import { TeachersSlider } from "@/components/about/teachers-slider";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading, SectionLabel } from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
import { getAboutContent } from "@/lib/about-content/api";
import { listFacilityImages } from "@/lib/facility-images/api";
import type { FacilityImage } from "@/lib/facility-images/types";
import { listTeachers } from "@/lib/teachers/api";
import type { Teacher } from "@/lib/teachers/types";

const FALLBACK_VISION =
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=800&fit=crop&auto=format";

export async function AboutPage() {
  let visionImageUrl = FALLBACK_VISION;
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
    // keep fallbacks
  }

  const values = [
    {
      icon: "❤️",
      title: "Tận Tâm",
      desc: "Mỗi học viên là một cá nhân đặc biệt. Chúng tôi cam kết đồng hành tận tâm trong suốt hành trình học tập.",
    },
    {
      icon: "🚀",
      title: "Sáng Tạo",
      desc: "Không ngừng đổi mới phương pháp, ứng dụng công nghệ để mang lại trải nghiệm học tập tốt nhất.",
    },
    {
      icon: "🌟",
      title: "Chất Lượng",
      desc: "Cam kết chất lượng giảng dạy cao nhất, với giáo viên được đào tạo bài bản và kiểm duyệt nghiêm ngặt.",
    },
    {
      icon: "🤝",
      title: "Đồng Hành",
      desc: "DKS không chỉ là trung tâm – là người bạn đồng hành đáng tin cậy trên con đường chinh phục tiếng Anh.",
    },
  ];

  return (
    <div className="bg-background">
      <PageHero
        label="Về DKS"
        title="Câu Chuyện Của Chúng Tôi"
        description="Hơn 8 năm đồng hành cùng học viên Việt Nam trên con đường chinh phục tiếng Anh và mở ra thế giới."
      />

      <Container className="py-20">
        <div className="mb-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionLabel>Tầm nhìn & Sứ mệnh</SectionLabel>
            <h2 className="mb-6 text-3xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)] md:text-4xl">
              Chúng Tôi Tin Rằng
              <br />
              Mọi Người Đều Có Thể
            </h2>
            <div className="space-y-6 font-[family-name:var(--font-body)]">
              <div className="flex gap-4">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-lg text-white">
                  🎯
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-[#4A2306] font-[family-name:var(--font-nunito)]">
                    Tầm nhìn
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Trở thành trung tâm tiếng Anh hàng đầu Việt Nam, nơi mỗi học viên tìm được phương
                    pháp học phù hợp và đạt mục tiêu một cách vui vẻ, bền vững.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-lg text-[#4A2306]">
                  💡
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-[#4A2306] font-[family-name:var(--font-nunito)]">
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
            <div className="relative h-80 overflow-hidden rounded-2xl">
              <Image
                src={visionImageUrl}
                alt="DKS English Center"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="text-3xl font-black text-primary font-[family-name:var(--font-nunito)]">
                8+
              </div>
              <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
                Năm kinh nghiệm
              </div>
            </div>
            <div className="absolute -top-5 -right-5 rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="text-3xl font-black text-accent font-[family-name:var(--font-nunito)]">
                2K+
              </div>
              <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
                Học viên
              </div>
            </div>
          </div>
        </div>

        <SectionHeading label="Giá trị cốt lõi" title="Những Gì DKS Tin Tưởng" />
        <div className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl bg-secondary p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">{v.icon}</div>
              <h3 className="mb-2 font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                {v.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground font-[family-name:var(--font-body)]">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        <SectionHeading
          label="Đội ngũ giáo viên"
          title="Những Người Thầy Tận Tâm"
          sub="Giáo viên DKS không chỉ giỏi chuyên môn mà còn đam mê giảng dạy, luôn lấy học viên làm trung tâm."
        />
        <TeachersSlider teachers={teachers} />

        <SectionHeading label="Cơ sở vật chất" title="Không Gian Học Tập Lý Tưởng" />
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A2306]/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-sm font-bold text-white font-[family-name:var(--font-nunito)]">
                  {facility.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
