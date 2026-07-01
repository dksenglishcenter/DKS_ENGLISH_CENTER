"use client";

import { HomePage } from "@/components/pages/home-page";
import { useDksNavigation } from "@/lib/navigation";

export default function Page() {
  const { setPage } = useDksNavigation();
  return <HomePage setPage={setPage} />;
}
