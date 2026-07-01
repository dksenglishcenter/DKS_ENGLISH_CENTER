"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Tag,
  TrendingUp,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { BLOGS } from "@/data/blogs";

export function BlogPage() {
  const [selectedCat, setSelectedCat] = useState("Tất cả");
  const cats = ["Tất cả", "IELTS Tips", "Học Tiếng Anh", "Thi Cử", "Công Nghệ", "Ngữ Pháp", "Phụ Huynh"];
  const displayed = selectedCat === "Tất cả" ? BLOGS : BLOGS.filter((b) => b.cat === selectedCat);
  const hotPosts = BLOGS.filter((b) => b.hot);

  return (
    <div className="bg-background">
      <PageHero
        label="Blog & Tin tức"
        title="Kiến Thức Tiếng Anh"
        description="Bài viết, mẹo học, tài liệu hữu ích từ đội ngũ giáo viên DKS – cập nhật hàng tuần."
      />

      <Container className="py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-8">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all font-[family-name:var(--font-nunito)] ${
                    selectedCat === c ? "bg-primary text-white" : "bg-secondary text-[#4A2306] hover:bg-primary/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayed.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                  <div className="relative h-48 bg-secondary overflow-hidden">
                    <UnsplashImage id={post.imgId} alt={post.title} className="w-full h-full group-hover:scale-105 transition-transform duration-500"/>
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full font-[family-name:var(--font-nunito)]">
                        {post.cat}
                      </span>
                    </div>
                    {post.hot && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-accent text-[#4A2306] text-xs font-bold px-2 py-1 rounded-full font-[family-name:var(--font-nunito)]">
                          🔥 Hot
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-[family-name:var(--font-body)]">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{post.readTime}</span>
                    </div>
                    <h3 className="font-black text-[#4A2306] text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors font-[family-name:var(--font-nunito)]">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 font-[family-name:var(--font-body)]">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-primary font-semibold text-sm font-[family-name:var(--font-nunito)]">
                      Đọc tiếp <ArrowRight className="w-4 h-4"/>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-black text-[#4A2306] mb-4 flex items-center gap-2 font-[family-name:var(--font-nunito)]">
                <Tag className="w-4 h-4 text-primary"/> Chuyên mục
              </h3>
              <div className="space-y-2">
                {cats.slice(1).map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCat(c)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <span className="text-sm font-medium text-[#4A2306] group-hover:text-primary transition-colors font-[family-name:var(--font-body)]">{c}</span>
                    <span className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground font-[family-name:var(--font-body)]">
                      {BLOGS.filter((b) => b.cat === c).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6">
              <h3 className="font-black text-[#4A2306] mb-4 flex items-center gap-2 font-[family-name:var(--font-nunito)]">
                <TrendingUp className="w-4 h-4 text-primary"/> Bài viết nổi bật
              </h3>
              <div className="space-y-4">
                {hotPosts.map((p, i) => (
                  <div key={p.id} className="flex gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white font-black text-sm flex items-center justify-center flex-shrink-0 font-[family-name:var(--font-nunito)]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#4A2306] group-hover:text-primary transition-colors line-clamp-2 font-[family-name:var(--font-body)]">{p.title}</p>
                      <span className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">{p.readTime} đọc</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #F16522, #FFA200)" }}>
              <div className="text-3xl mb-3">📥</div>
              <h3 className="font-black text-white mb-2 font-[family-name:var(--font-nunito)]">Tài liệu miễn phí</h3>
              <p className="text-orange-50 text-sm mb-4 font-[family-name:var(--font-body)]">Bộ đề IELTS 2024, từ vựng theo chủ đề, giáo án luyện thi vào 10.</p>
              <button className="w-full bg-white text-primary font-bold py-2.5 rounded-lg hover:bg-orange-50 transition-colors text-sm flex items-center justify-center gap-2 font-[family-name:var(--font-nunito)]">
                <FileText className="w-4 h-4"/> Tải về miễn phí
              </button>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
