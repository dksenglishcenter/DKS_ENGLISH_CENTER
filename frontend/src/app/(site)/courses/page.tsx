"use client";

import { CoursesPage } from "@/components/pages/courses-page";
import { useDksNavigation } from "@/lib/navigation";

export default function Page() {
  const { setPage } = useDksNavigation();
  return <CoursesPage setPage={setPage} />;
}
