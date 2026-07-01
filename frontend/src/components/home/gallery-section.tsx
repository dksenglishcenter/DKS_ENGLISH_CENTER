import { Camera } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { GALLERY_PHOTOS } from "@/data/gallery";

export function GallerySection() {
  return (
    <section className="py-20 md:py-28 bg-muted">
      <Container>
        <SectionHeading
          label="Hình ảnh học tập"
          title="Môi Trường Học Tập Tại DKS"
          sub="Không gian học tập hiện đại, thân thiện – nơi mỗi buổi học là một trải nghiệm thú vị."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-secondary group cursor-pointer row-span-2" style={{ minHeight: 420 }}>
            <UnsplashImage id={GALLERY_PHOTOS[0].id} alt={GALLERY_PHOTOS[0].alt} className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-[#4A2306]/0 group-hover:bg-[#4A2306]/30 transition-colors duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
          </div>
          {[GALLERY_PHOTOS[1], GALLERY_PHOTOS[2]].map((p, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-secondary group cursor-pointer" style={{ height: 200 }}>
              <UnsplashImage id={p.id} alt={p.alt} className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-[#4A2306]/0 group-hover:bg-[#4A2306]/30 transition-colors duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
            </div>
          ))}
          <div className="relative overflow-hidden rounded-2xl bg-secondary group cursor-pointer md:col-span-2" style={{ height: 200 }}>
            <UnsplashImage id={GALLERY_PHOTOS[3].id} alt={GALLERY_PHOTOS[3].alt} className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-[#4A2306]/0 group-hover:bg-[#4A2306]/30 transition-colors duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[GALLERY_PHOTOS[4], GALLERY_PHOTOS[5]].map((p, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-secondary group cursor-pointer" style={{ height: 200 }}>
              <UnsplashImage id={p.id} alt={p.alt} className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-[#4A2306]/0 group-hover:bg-[#4A2306]/30 transition-colors duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
