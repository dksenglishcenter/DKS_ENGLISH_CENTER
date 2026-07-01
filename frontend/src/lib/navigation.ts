"use client";

import { usePathname, useRouter } from "next/navigation";

export type Page = "home" | "courses" | "about" | "blog" | "careers" | "contact";
export type SetPage = (p: Page) => void;

export const PAGE_PATHS: Record<Page, string> = {
  home: "/",
  courses: "/courses",
  about: "/about",
  blog: "/blog",
  careers: "/careers",
  contact: "/contact",
};

const PATH_PAGES: Record<string, Page> = {
  "/": "home",
  "/courses": "courses",
  "/about": "about",
  "/blog": "blog",
  "/careers": "careers",
  "/contact": "contact",
};

export function useDksNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const activePage = PATH_PAGES[pathname] ?? "home";

  const setPage: SetPage = (page) => {
    router.push(PAGE_PATHS[page]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { activePage, setPage };
}
