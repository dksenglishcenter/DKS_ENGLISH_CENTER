import { redirect } from "next/navigation";

import { features } from "@/lib/features";

/** The whole exam area is hidden until the mock-test feature is turned on. */
export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!features.mockTest) redirect("/");
  return <>{children}</>;
}
