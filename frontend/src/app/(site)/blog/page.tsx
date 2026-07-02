import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { getBlogPosts } from "@/lib/blog/api";

/** ISR: build sẵn HTML, refresh tối đa mỗi giờ. */
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="bg-background min-h-screen">
      <PageHero
        label="Blog DKS"
        title="Mẹo Học Tiếng Anh & IELTS"
        description="Khung ISR — dev sau nối API/CMS. Trang được build tĩnh và tự cập nhật định kỳ."
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </Container>
    </div>
  );
}
