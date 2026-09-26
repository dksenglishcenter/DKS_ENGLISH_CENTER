export type Page =
  | "home"
  | "courses"
  | "exam"
  | "about"
  | "events"
  | "blog"
  | "careers"
  | "contact"
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "admin"
  | "parent";

export const PAGE_PATHS: Record<Page, string> = {
  home: "/",
  courses: "/courses",
  exam: "/exam",
  about: "/about",
  events: "/su-kien",
  blog: "/blog",
  careers: "/careers",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  admin: "/admin",
  parent: "/parent",
};

const PATH_PAGES: Record<string, Page> = {
  "/": "home",
  "/courses": "courses",
  "/exam": "exam",
  "/about": "about",
  "/su-kien": "events",
  "/blog": "blog",
  "/careers": "careers",
  "/contact": "contact",
};

export function getActivePage(pathname: string): Page {
  const exactMatch = PATH_PAGES[pathname];
  if (exactMatch) {
    return exactMatch;
  }

  const nestedMatch = Object.entries(PATH_PAGES).find(
    ([path]) => path !== "/" && pathname.startsWith(`${path}/`),
  );

  return nestedMatch?.[1] ?? "home";
}
