import { EventsPage } from "@/components/pages/events-page";
import { listEventPhotos } from "@/lib/event-photos/api";
import { listEvents } from "@/lib/events/api";

export const revalidate = 60;

export default async function Page() {
  const [eventsRes, photosRes] = await Promise.all([
    listEvents().catch(() => ({ events: [] })),
    listEventPhotos().catch(() => ({ images: [] })),
  ]);

  return (
    <EventsPage events={eventsRes.events} photos={photosRes.images} />
  );
}
