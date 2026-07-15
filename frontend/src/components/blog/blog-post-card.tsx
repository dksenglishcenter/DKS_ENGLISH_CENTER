import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

import { UnsplashImage } from "@/components/media/unsplash-image";
import type { BlogPostSummary } from "@/data/blog-posts";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl motion-reduce:transform-none">
      <Link
        href={`/blog/${post.slug}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="relative h-48 overflow-hidden bg-secondary">
          <UnsplashImage
            id={post.coverImageId}
            alt={post.title}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 420px"
            className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white font-[family-name:var(--font-heading)]">
            {post.category}
          </span>
          {post.featured ? (
            <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-1 text-xs font-bold text-[#4A2306] font-[family-name:var(--font-heading)]">
              🔥 Hot
            </span>
          ) : null}
        </div>

        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.publishedAt} className="flex items-center gap-1">
              <Calendar aria-hidden="true" className="size-3" />
              {DATE_FORMATTER.format(new Date(`${post.publishedAt}T00:00:00Z`))}
            </time>
            <span className="flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3" />
              {post.readTimeMinutes} phút
            </span>
          </div>
          <h2 className="mb-2 line-clamp-2 text-base font-black text-[#4A2306] transition-colors group-hover:text-primary font-[family-name:var(--font-heading)]">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary font-[family-name:var(--font-heading)]">
            Đọc tiếp <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
