import { HomePage } from "@/components/pages/home-page";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Trang chủ",
  description:
    "DKS English Center — chương trình tiếng Anh truyền cảm hứng với lộ trình phù hợp cho từng mục tiêu học tập.",
  path: "/",
});

export default async function Page() {
  return <HomePage />;
}
