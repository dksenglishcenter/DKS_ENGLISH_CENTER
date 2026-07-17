import type { Course } from "@/lib/courses/types";
import { formatJobSalary } from "@/lib/jobs/salary";
import type { PublicJob } from "@/lib/jobs/types";
import { getSiteUrl, siteConfig } from "./config";

export function organizationSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteUrl,
    description: siteConfig.description,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address.addressLocality,
      addressCountry: siteConfig.address.addressCountry,
    },
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    knowsAbout: [
      "English entrance exam preparation for grade 10",
      "Vietnamese high school graduation exam preparation",
      "IELTS preparation",
      "Global Success English curriculum",
    ],
  };
}

export function coursesPageSchema(courses: Course[]) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Khóa học tiếng Anh tại DKS",
    description:
      "Các khóa luyện thi vào lớp 10, THPT và Đại học, IELTS 1:1 và tiếng Anh Global Success lớp 1–9 tại DKS English Center.",
    url: `${siteUrl}/courses`,
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteUrl,
        },
        educationalLevel: course.level,
        ...(course.tuition !== "Liên hệ tư vấn"
          ? {
              offers: {
                "@type": "Offer",
                price: course.tuition,
                priceCurrency: "VND",
                category: course.subtitle,
              },
            }
          : {}),
        url: `${siteUrl}/courses#${course.slug}`,
      },
    })),
  };
}

export function aboutPageSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/about#webpage`,
        url: `${siteUrl}/about`,
        name: "Về DKS English Center",
        description:
          "Tìm hiểu sứ mệnh, đội ngũ giáo viên và cơ sở vật chất của trung tâm tiếng Anh DKS.",
        isPartOf: { "@id": `${siteUrl}/#organization` },
        inLanguage: siteConfig.language,
      },
    ],
  };
}

function getEmploymentTypes(type: string) {
  const normalizedType = type.toLocaleLowerCase("en-US");
  const employmentTypes = [
    normalizedType.includes("full-time") ? "FULL_TIME" : null,
    normalizedType.includes("part-time") ? "PART_TIME" : null,
    normalizedType.includes("freelance") ? "CONTRACTOR" : null,
  ].filter((value): value is string => value !== null);

  return employmentTypes.length > 0 ? employmentTypes : ["OTHER"];
}

export function careersPageSchema(jobs: readonly PublicJob[]) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/careers#webpage`,
        url: `${siteUrl}/careers`,
        name: "Tuyển dụng DKS English Center",
        description:
          "Cơ hội nghề nghiệp tại DKS — giáo viên IELTS, tư vấn tuyển sinh, gia sư tiếng Anh.",
        isPartOf: { "@id": `${siteUrl}/#organization` },
        inLanguage: siteConfig.language,
      },
      ...jobs.map((job) => ({
        "@type": "JobPosting",
        title: job.title,
        description: `${job.req}. Nhiệm vụ: ${job.duties.join(". ")}. Quyền lợi: ${job.benefits.join(". ")}. Mức lương: ${formatJobSalary(job)}.`,
        employmentType: getEmploymentTypes(job.type),
        hiringOrganization: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: siteConfig.name,
          sameAs: siteUrl,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.location,
            addressCountry: "VN",
          },
        },
        url: `${siteUrl}/careers#job-${job.id}`,
      })),
    ],
  };
}
