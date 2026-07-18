import { Newspaper } from "lucide-react";

import { BlogIndex } from "@/components/blog/blog-index";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import type { BlogPostSummary } from "@/lib/blog/types";

export function BlogPage({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        icon={Newspaper}
        label="Blog & Tin tức"
        title="Kiến Thức Tiếng Anh"
        description="Bài viết, mẹo học, tài liệu hữu ích từ đội ngũ giáo viên DKS – cập nhật hàng tuần."
      />

      <Container className="py-16">
        <BlogIndex posts={posts} />
      </Container>
    </div>
  );
}
