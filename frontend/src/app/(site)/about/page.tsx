import { AboutPage } from "@/components/pages/about-page";

/** Static HTML rebuilt in the background at most once an hour, so page loads
 *  don't wait on the backend (and survive it being asleep). */
export const revalidate = 3600;

export default function Page() {
  return <AboutPage />;
}
