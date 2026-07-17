import { CareersPage } from "@/components/pages/careers-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicJobs } from "@/lib/jobs/server";
import { careersPageSchema } from "@/lib/seo/schemas";

export default async function Page() {
  const jobs = await getPublicJobs();

  return (
    <>
      <JsonLd data={careersPageSchema(jobs)} />
      <CareersPage jobs={jobs} />
    </>
  );
}
