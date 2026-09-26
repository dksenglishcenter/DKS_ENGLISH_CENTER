"use client";

import { FileText, Hash, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Reveal } from "@/components/motion/reveal";
import type { BlogPostSummary } from "@/lib/blog/types";
import { formatBlogTag, normalizeBlogTag } from "@/lib/blog/types";

const ALL_CATEGORIES = "Tất cả";

export function BlogIndex({
  posts,
  initialTag = null,
}: {
  posts: BlogPostSummary[];
  initialTag?: string | null;
}) {
  const tagFromUrl = normalizeBlogTag(initialTag ?? "");

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedTag, setSelectedTag] = useState<string | null>(
    tagFromUrl || null,
  );

  useEffect(() => {
    setSelectedTag(tagFromUrl || null);
  }, [tagFromUrl]);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(posts.map((post) => post.category)))],
    [posts],
  );

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [posts]);

  const visiblePosts = posts.filter((post) => {
    if (selectedCategory !== ALL_CATEGORIES && post.category !== selectedCategory) {
      return false;
    }
    if (
      selectedTag &&
      !(post.tags ?? []).some(
        (tag) => tag.toLowerCase() === selectedTag.toLowerCase(),
      )
    ) {
      return false;
    }
    return true;
  });

  /** Bài tick Featured trong admin, giữ thứ tự API (sortOrder → ngày đăng), tối đa 5. */
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 5);

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
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {selectedTag ? (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Đang lọc hashtag{" "}
              <span className="font-semibold text-primary">{formatBlogTag(selectedTag)}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Bỏ lọc
            </button>
          </div>
        ) : null}

        {visiblePosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có bài viết phù hợp bộ lọc.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {visiblePosts.map((post, index) => (
              <Reveal key={post.slug} delayMs={Math.min(index, 5) * 50}>
                <BlogPostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-6 lg:w-72 lg:flex-none" aria-label="Thông tin Blog">
        <Reveal>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-foreground font-[family-name:var(--font-heading)]">
              <Hash aria-hidden="true" className="size-4 text-primary" /> Hashtags
            </h2>
            {tagCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có hashtag.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagCounts.map(([tag, count]) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {formatBlogTag(tag)}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[0.65rem] ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-card text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delayMs={60}>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-foreground font-[family-name:var(--font-heading)]">
              <TrendingUp aria-hidden="true" className="size-4 text-primary" /> Bài viết nổi bật
            </h2>
            <ol className="space-y-4">
              {featuredPosts.map((post, index) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground font-[family-name:var(--font-heading)]">
                      {index + 1}
                    </span>
                    <span>
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
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
        </Reveal>

        <Reveal delayMs={100}>
          <section className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
            <div aria-hidden="true" className="mb-3 text-3xl">
              📥
            </div>
            <h2 className="mb-2 text-lg font-black font-[family-name:var(--font-heading)]">
              Tài liệu miễn phí
            </h2>
            <p className="mb-4 text-sm opacity-90">
              Nhận tài liệu luyện IELTS, từ vựng theo chủ đề và hướng dẫn ôn thi.
            </p>
            <Link
              href="/contact"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <FileText aria-hidden="true" className="size-4" /> Nhận tài liệu miễn phí
            </Link>
          </section>
        </Reveal>
      </aside>
    </div>
  );
}
