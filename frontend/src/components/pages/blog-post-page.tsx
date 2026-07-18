import { ArrowLeft, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ShareButton } from "@/components/blog/share-button";
import { Container } from "@/components/layout/container";
import { CourseCoverImage } from "@/components/media/course-cover-image";
import { BlogMarkdownBody } from "@/lib/blog/blog-markdown";
import { formatBlogDate } from "@/lib/blog/format";
import type { BlogPost, BlogPostSummary } from "@/lib/blog/types";

type BlogPostPageProps = {
  post: BlogPost;
  relatedPosts: BlogPostSummary[];
  categories: string[];
};

export function BlogPostPage({
  post,
  relatedPosts,
  categories,
}: BlogPostPageProps) {
  const formattedDate = formatBlogDate(post.publishedAt);

  return (
    <article className="min-h-screen bg-card">
      <header className="relative h-72 overflow-hidden bg-muted md:h-96">
        <CourseCoverImage
          src={post.coverImageUrl}
          alt={post.title}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-black/20 to-transparent" />
        <Container className="absolute inset-x-0 bottom-0 pb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              {post.category}
            </span>
            {post.featured ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                🔥 Hot
              </span>
            ) : null}
          </div>
          <h1 className="max-w-3xl text-2xl font-black leading-tight text-white md:text-4xl font-[family-name:var(--font-heading)]">
            {post.title}
          </h1>
        </Container>
      </header>

      <Container className="py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-8 flex items-center justify-between gap-4">
              <Link
                href="/blog"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowLeft aria-hidden="true" className="size-4" /> Quay lại Blog
              </Link>
              <ShareButton title={post.title} />
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-muted pb-6 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                <Calendar aria-hidden="true" className="size-4" /> {formattedDate}
              </time>
              <span className="flex items-center gap-1.5">
                <Clock aria-hidden="true" className="size-4" /> {post.readTimeMinutes} phút đọc
              </span>
              <span className="flex items-center gap-1.5">
                <Tag aria-hidden="true" className="size-4" /> {post.category}
              </span>
            </div>

            <div className="mb-8 flex items-center gap-3 rounded-xl bg-secondary p-4">
              <div className="flex size-10 flex-none items-center justify-center rounded-full bg-primary text-sm font-black text-white font-[family-name:var(--font-heading)]">
                D
              </div>
              <div>
                <p className="text-sm font-bold text-foreground font-[family-name:var(--font-heading)]">
                  Đội ngũ DKS English Center
                </p>
                <p className="text-xs text-muted-foreground">Giáo viên & Chuyên gia tiếng Anh</p>
              </div>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-foreground">{post.intro}</p>

            <div className="space-y-10">
              {post.sections.map((section, index) => {
                const linkHref = section.linkHref?.trim();
                const linkLabel = section.linkLabel?.trim() || linkHref;
                const isExternal = Boolean(linkHref?.startsWith("http"));

                return (
                  <section key={`${section.heading}-${index}`} className="space-y-4">
                    <h2 className="text-xl font-black text-foreground font-[family-name:var(--font-heading)]">
                      {section.heading}
                    </h2>
                    <BlogMarkdownBody content={section.body} />
                    {/* Legacy fields from older posts (optional) */}
                    {section.imageUrl ? (
                      <figure className="overflow-hidden rounded-2xl border border-border bg-muted">
                        <div className="relative aspect-[16/10] w-full">
                          <Image
                            src={section.imageUrl}
                            alt={section.imageAlt?.trim() || section.heading}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 720px"
                            unoptimized
                          />
                        </div>
                      </figure>
                    ) : null}
                    {linkHref && linkLabel ? (
                      <p>
                        <Link
                          href={linkHref}
                          className="inline-flex min-h-10 items-center font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          {...(isExternal
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {linkLabel} →
                        </Link>
                      </p>
                    ) : null}
                  </section>
                );
              })}
            </div>

            <section className="mt-10 rounded-2xl border border-primary/20 bg-secondary p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-black text-foreground font-[family-name:var(--font-heading)]">
                <BookOpen aria-hidden="true" className="size-5 text-primary" /> Tóm lại
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{post.takeaway}</p>
            </section>
          </div>

          <aside className="space-y-6 lg:w-72 lg:flex-none" aria-label="Thông tin liên quan">
            <section className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white">
              <h2 className="mb-2 text-lg font-black font-[family-name:var(--font-heading)]">
                Muốn học hiệu quả hơn?
              </h2>
              <p className="mb-4 text-sm opacity-90">
                Đăng ký học thử miễn phí và nhận lộ trình cá nhân hóa từ DKS.
              </p>
              <Link
                href="/contact"
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-card px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Đăng ký học thử →
              </Link>
            </section>

            <section className="rounded-2xl border border-muted bg-card p-5">
              <h2 className="mb-4 text-base font-black text-foreground font-[family-name:var(--font-heading)]">
                Bài viết liên quan
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group flex gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="relative h-12 w-16 flex-none overflow-hidden rounded-lg bg-muted">
                      <CourseCoverImage
                        src={relatedPost.coverImageUrl}
                        alt=""
                        sizes="64px"
                        className="transition-opacity group-hover:opacity-90"
                      />
                    </span>
                    <span>
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {relatedPost.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {relatedPost.readTimeMinutes} phút đọc
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <nav className="rounded-2xl border border-muted bg-card p-5" aria-label="Chuyên mục Blog">
              <h2 className="mb-3 text-base font-black text-foreground font-[family-name:var(--font-heading)]">
                Chuyên mục
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href="/blog"
                    className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      </Container>
    </article>
  );
}
