import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { SectionHeading, SectionLabel } from "@/components/layout/section-heading";
import { CloudinaryGalleryImage } from "@/components/media/cloudinary-gallery-image";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { TEACHERS } from "@/data/teachers";

const FACILITIES = [
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020315/dks-english-center/about/facilities/imfrxincq533ykg5jdmc.jpg",
    label: "Phòng học tiêu chuẩn",
    objectPosition: "center 58%",
  },
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020413/dks-english-center/about/facilities/fyvn6ekkalj1oseb75ns.jpg",
    label: "Phòng học trang bị màn hình",
    objectPosition: "center 58%",
  },
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020448/dks-english-center/about/facilities/cpypxhzpasixzeut7dit.jpg",
    label: "Không gian sinh hoạt chung",
    objectPosition: "center 48%",
  },
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020477/dks-english-center/about/facilities/fjqblom7jhl2hluwlrxv.jpg",
    label: "Khu vực lễ tân DKS",
    objectPosition: "center 48%",
  },
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020589/dks-english-center/about/facilities/qv93fme2iiasoqoc07mn.jpg",
    label: "Hoạt động học tập tại trung tâm",
    objectPosition: "center 55%",
  },
  {
    src: "https://res.cloudinary.com/hw92uddx/image/upload/v1784020643/dks-english-center/about/facilities/woyt47e6coy4ji9sq8pr.jpg",
    label: "Lớp học thiếu nhi",
    objectPosition: "center 62%",
  },
] as const;

export function AboutPage() {
  const values = [
    { icon: "❤️", title: "Tận Tâm", desc: "Mỗi học viên là một cá nhân đặc biệt. Chúng tôi cam kết đồng hành tận tâm trong suốt hành trình học tập." },
    { icon: "🚀", title: "Sáng Tạo", desc: "Không ngừng đổi mới phương pháp, ứng dụng công nghệ để mang lại trải nghiệm học tập tốt nhất." },
    { icon: "🌟", title: "Chất Lượng", desc: "Cam kết chất lượng giảng dạy cao nhất, với giáo viên được đào tạo bài bản và kiểm duyệt nghiêm ngặt." },
    { icon: "🤝", title: "Đồng Hành", desc: "DKS không chỉ là trung tâm – là người bạn đồng hành đáng tin cậy trên con đường chinh phục tiếng Anh." },
  ];

  return (
    <div className="bg-background">
      <PageHero
        label="Về DKS"
        title="Câu Chuyện Của Chúng Tôi"
        description="Hơn 8 năm đồng hành cùng học viên Việt Nam trên con đường chinh phục tiếng Anh và mở ra thế giới."
      />

      <Container className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <SectionLabel>Tầm nhìn & Sứ mệnh</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-black text-[#4A2306] mb-6 font-[family-name:var(--font-nunito)]">
              Chúng Tôi Tin Rằng<br/>Mọi Người Đều Có Thể
            </h2>
            <div className="space-y-6 font-[family-name:var(--font-body)]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0 text-lg mt-0.5">🎯</div>
                <div>
                  <h4 className="font-bold text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">Tầm nhìn</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Trở thành trung tâm tiếng Anh hàng đầu Việt Nam, nơi mỗi học viên tìm được phương pháp học phù hợp và đạt mục tiêu một cách vui vẻ, bền vững.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-[#4A2306] flex-shrink-0 text-lg mt-0.5">💡</div>
                <div>
                  <h4 className="font-bold text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">Sứ mệnh</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">Cung cấp nền giáo dục tiếng Anh chất lượng cao, sáng tạo và cá nhân hóa – giúp học viên không chỉ học tốt tiếng Anh mà còn yêu thích ngôn ngữ này.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden h-80">
              <UnsplashImage
                id="1580582932707-520aed937b7b"
                alt="DKS English Center"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl border border-border shadow-xl p-5">
              <div className="text-3xl font-black text-primary font-[family-name:var(--font-nunito)]">8+</div>
              <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">Năm kinh nghiệm</div>
            </div>
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl border border-border shadow-xl p-5">
              <div className="text-3xl font-black text-accent font-[family-name:var(--font-nunito)]">2K+</div>
              <div className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">Học viên</div>
            </div>
          </div>
        </div>

        <SectionHeading label="Giá trị cốt lõi" title="Những Gì DKS Tin Tưởng" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {values.map((v) => (
            <div key={v.title} className="bg-secondary rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-4xl mb-4">{v.icon}</div>
              <h3 className="font-black text-[#4A2306] mb-2 font-[family-name:var(--font-nunito)]">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-[family-name:var(--font-body)]">{v.desc}</p>
            </div>
          ))}
        </div>

        <SectionHeading
          label="Đội ngũ giáo viên"
          title="Những Người Thầy Tận Tâm"
          sub="Giáo viên DKS không chỉ giỏi chuyên môn mà còn đam mê giảng dạy, luôn lấy học viên làm trung tâm."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {TEACHERS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative h-52 bg-secondary overflow-hidden">
                <UnsplashImage
                  id={t.imgId}
                  alt={t.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A2306]/60 to-transparent"/>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block font-[family-name:var(--font-nunito)]">
                    {t.exp}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">{t.name}</h3>
                <div className="text-xs text-primary font-semibold mb-2 font-[family-name:var(--font-body)]">{t.title}</div>
                <div className="text-xs text-muted-foreground mb-3 font-medium font-[family-name:var(--font-body)]">{t.cred}</div>
                <p className="text-justify text-xs leading-relaxed text-muted-foreground font-[family-name:var(--font-body)]">
                  {t.bio}
                </p>
              </div>
            </div>
          ))}
        </div>

        <SectionHeading label="Cơ sở vật chất" title="Không Gian Học Tập Lý Tưởng" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FACILITIES.map((facility) => (
            <div key={facility.src} className="group relative h-[200px] overflow-hidden rounded-2xl bg-secondary">
              <CloudinaryGalleryImage
                src={facility.src}
                alt={facility.label}
                sizes="(max-width: 767px) 50vw, 33vw"
                objectPosition={facility.objectPosition}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A2306]/70 to-transparent"/>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-sm font-bold text-white font-[family-name:var(--font-nunito)]">
                  {facility.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
