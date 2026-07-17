import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

import { CourseCoverImage } from "@/components/media/course-cover-image";
import { formatBlogDate } from "@/lib/blog/format";
import type { BlogPostSummary } from "@/lib/blog/types";

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl motion-reduce:transform-none">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="relative h-48 flex-none overflow-hidden bg-secondary">
          <CourseCoverImage
            src={post.coverImageUrl}
            alt={post.title}
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

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.publishedAt} className="flex items-center gap-1">
              <Calendar aria-hidden="true" className="size-3" />
              {formatBlogDate(post.publishedAt)}
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
          <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-primary font-[family-name:var(--font-heading)]">
            Đọc tiếp <ArrowRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}
