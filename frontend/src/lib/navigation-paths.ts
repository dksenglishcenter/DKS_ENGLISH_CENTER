export type Page = "home" | "courses" | "about" | "blog" | "careers" | "contact";

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

export function getActivePage(pathname: string): Page {
  return PATH_PAGES[pathname] ?? "home";
}
