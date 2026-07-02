import Link from "next/link";

import { UnsplashImage } from "@/components/media/unsplash-image";
import type { BlogPost } from "@/data/blog-posts";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <UnsplashImage
            id={post.coverImageId}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-6">
          <time
            dateTime={post.publishedAt}
            className="text-xs text-muted-foreground font-[family-name:var(--font-body)]"
          >
            {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
          </time>
          <h2 className="mt-2 text-xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {post.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-[family-name:var(--font-body)]">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
