import { COURSES } from "@/data/courses";
import { JOBS } from "@/data/jobs";
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

export function coursesPageSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Khóa học tiếng Anh tại DKS",
    description:
      "Các khóa luyện thi vào lớp 10, THPT và Đại học, IELTS 1:1 và tiếng Anh Global Success lớp 1–9 tại DKS English Center.",
    url: `${siteUrl}/courses`,
    numberOfItems: COURSES.length,
    itemListElement: COURSES.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.desc,
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
        url: `${siteUrl}/courses#${course.id}`,
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

export function careersPageSchema() {
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
      ...JOBS.map((job) => ({
        "@type": "JobPosting",
        title: job.title,
        description: `${job.req}. ${job.duties.join(". ")}.`,
        employmentType: job.type.includes("Full-time")
          ? "FULL_TIME"
          : job.type.includes("Part-time")
            ? "PART_TIME"
            : "CONTRACTOR",
        hiringOrganization: {
          "@type": "Organization",
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
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "VND",
          value: {
            "@type": "QuantitativeValue",
            value: job.salary,
            unitText: "MONTH",
          },
        },
        url: `${siteUrl}/careers#job-${job.id}`,
      })),
    ],
  };
}
