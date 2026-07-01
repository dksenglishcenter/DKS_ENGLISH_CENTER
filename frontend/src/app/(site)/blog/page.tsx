import { Container } from "@/components/layout/container";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Blog DKS English Center — đang được cập nhật.",
  path: "/blog",
  noIndex: true,
});

export default function Page() {
  return (
    <Container className="min-h-[50vh] py-16">
      <div />
    </Container>
  );
}
