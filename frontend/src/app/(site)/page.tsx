import { Container } from "@/components/layout/container";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Trang chủ",
  description: "DKS English Center — Trang chủ đang được cập nhật.",
  path: "/",
  noIndex: true,
});

export default function Page() {
  return (
    <Container className="min-h-[50vh] py-16">
      <div />
    </Container>
  );
}
