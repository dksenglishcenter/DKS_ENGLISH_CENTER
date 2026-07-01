import { SiteLayout } from "@/components/site-layout";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
