"use client";

import { FileText, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import type { BlogPostSummary } from "@/data/blog-posts";

const ALL_CATEGORIES = "Tất cả";

export function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const categories = [
    ALL_CATEGORIES,
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];
  const visiblePosts =
    selectedCategory === ALL_CATEGORIES
      ? posts
      : posts.filter((post) => post.category === selectedCategory);
  const featuredPosts = posts.filter((post) => post.featured);

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <section className="min-w-0 flex-1" aria-labelledby="blog-posts-heading">
        <h2 id="blog-posts-heading" className="sr-only">
          Danh sách bài viết
        </h2>
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Lọc theo chuyên mục">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 font-[family-name:var(--font-heading)] ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-secondary text-[#4A2306] hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {visiblePosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <aside className="space-y-6 lg:w-72 lg:flex-none" aria-label="Thông tin Blog">
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-black text-[#4A2306] font-[family-name:var(--font-heading)]">
            <Tag aria-hidden="true" className="size-4 text-primary" /> Chuyên mục
          </h2>
          <div className="space-y-2">
            {categories.slice(1).map((category) => {
              const count = posts.filter((post) => post.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className="group flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-sm font-medium text-[#4A2306] transition-colors group-hover:text-primary">
                    {category}
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-black text-[#4A2306] font-[family-name:var(--font-heading)]">
            <TrendingUp aria-hidden="true" className="size-4 text-primary" /> Bài viết nổi bật
          </h2>
          <ol className="space-y-4">
            {featuredPosts.map((post, index) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary text-sm font-black text-white font-[family-name:var(--font-heading)]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-[#4A2306] transition-colors group-hover:text-primary">
                      {post.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.readTimeMinutes} phút đọc
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white">
          <div aria-hidden="true" className="mb-3 text-3xl">📥</div>
          <h2 className="mb-2 text-lg font-black font-[family-name:var(--font-heading)]">
            Tài liệu miễn phí
          </h2>
          <p className="mb-4 text-sm text-orange-50">
            Nhận tài liệu luyện IELTS, từ vựng theo chủ đề và hướng dẫn ôn thi.
          </p>
          <Link
            href="/contact"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <FileText aria-hidden="true" className="size-4" /> Nhận tài liệu miễn phí
          </Link>
        </section>
      </aside>
    </div>
  );
}
