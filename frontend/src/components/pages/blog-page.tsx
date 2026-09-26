import { Newspaper } from "lucide-react";

import { BlogIndex } from "@/components/blog/blog-index";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import type { BlogPostSummary } from "@/lib/blog/types";

export function BlogPage({
  posts,
  initialTag = null,
}: {
  posts: BlogPostSummary[];
  initialTag?: string | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        icon={Newspaper}
        label="Blog & Tin tức"
        title="Kiến thức tiếng Anh"
        description="Bài viết, mẹo học, tài liệu hữu ích từ đội ngũ giáo viên DKS – cập nhật hàng tuần."
      />

      <Container className="py-16">
        <BlogIndex posts={posts} initialTag={initialTag} />
      </Container>
    </div>
  );
}
