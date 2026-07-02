import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { UnsplashImage } from "@/components/media/unsplash-image";
import { Button } from "@/components/ui/button";
import {
  getBlogPostBySlug,
  getBlogPosts,
} from "@/lib/blog/api";
import { createPageMetadata } from "@/lib/seo/metadata";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

/** ISR kết hợp SSG (generateStaticParams) + refresh định kỳ. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    noIndex: true,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-background min-h-screen">
      <Container className="py-16 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2">
          <Link href="/blog">← Quay lại Blog</Link>
        </Button>

        <header className="mb-8">
          <time
            dateTime={post.publishedAt}
            className="text-sm text-muted-foreground font-[family-name:var(--font-body)]"
          >
            {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
          </time>
          <h1 className="mt-3 text-3xl md:text-4xl font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-[family-name:var(--font-body)]">
            {post.excerpt}
          </p>
        </header>

        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-secondary">
          <UnsplashImage
            id={post.coverImageId}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="prose prose-neutral max-w-none">
          {post.content.split("\n\n").map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mb-4 text-[#4A2306] leading-relaxed font-[family-name:var(--font-body)]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </article>
  );
}
