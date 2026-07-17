"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Heart,
  MapPin,
} from "lucide-react";

import { CareerApplicationForm } from "@/components/forms/career-application-form";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatJobSalary } from "@/lib/jobs/salary";
import type { PublicJob } from "@/lib/jobs/types";

export function CareersPage({ jobs }: { jobs: PublicJob[] }) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="bg-background">
      <PageHero
        label="Tuyển dụng"
        title={
          <>
            Cùng DKS Tạo Ra
            <br />
            Sự Khác Biệt
          </>
        }
        description="Bạn đam mê giáo dục, yêu tiếng Anh và muốn tạo ra tác động tích cực? DKS đang tìm kiếm bạn!"
      />

      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-black text-[#4A2306] mb-6 font-[family-name:var(--font-nunito)]">
              Vị Trí Đang Tuyển ({jobs.length})
            </h2>
            {jobs.length === 0 ? (
              <div
                role="status"
                className="rounded-2xl border border-border bg-white px-6 py-10 text-center"
              >
                <Briefcase
                  className="mx-auto size-10 text-primary"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-black text-[#4A2306] font-[family-name:var(--font-nunito)]">
                  Hiện chưa có vị trí đang tuyển
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vui lòng quay lại sau để xem các cơ hội mới từ DKS.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {jobs.map((job) => (
                  <AccordionItem
                    key={job.id}
                    id={`job-${job.id}`}
                    value={String(job.id)}
                    className="bg-white rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-md border-b-0"
                  >
                    <AccordionTrigger className="w-full flex items-start gap-4 p-6 text-left hover:no-underline [&>svg]:text-primary [&>svg]:mt-1">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs font-[family-name:var(--font-body)]">
                          <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {job.type}
                          </span>
                          <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                            {formatJobSalary(job)}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 space-y-5">
                      <div className="text-xs text-muted-foreground bg-secondary rounded-lg px-4 py-2.5 font-[family-name:var(--font-body)]">
                        <span className="font-semibold text-[#4A2306]">
                          Yêu cầu:{" "}
                        </span>
                        {job.req}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <h4 className="text-sm font-black text-[#4A2306] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-nunito)]">
                            <BookOpen className="w-4 h-4 text-primary" /> Nhiệm
                            vụ
                          </h4>
                          <ul className="space-y-2">
                            {job.duties.map((d, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-muted-foreground font-[family-name:var(--font-body)]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#4A2306] mb-3 flex items-center gap-1.5 font-[family-name:var(--font-nunito)]">
                            <Heart className="w-4 h-4 text-primary" /> Quyền lợi
                          </h4>
                          <ul className="space-y-2">
                            {job.benefits.map((b, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-muted-foreground font-[family-name:var(--font-body)]"
                              >
                                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSuccessMessage("");
                          setSelectedJobId(job.id);
                          document
                            .getElementById("career-application")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Ứng tuyển ngay <ArrowRight className="w-4 h-4" />
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {jobs.length > 0 ? (
            <div className="lg:col-span-2" id="career-application">
              <div className="bg-white rounded-2xl border border-border p-8 sticky top-24">
                <div className="text-3xl mb-3">✉️</div>
                <h2 className="text-xl font-black text-[#4A2306] mb-1 font-[family-name:var(--font-nunito)]">
                  Gửi Đơn Ứng Tuyển
                </h2>
                <p className="text-sm text-muted-foreground mb-6 font-[family-name:var(--font-body)]">
                  Điền thông tin và chúng tôi sẽ liên hệ trong 24 giờ.
                </p>

                {successMessage ? (
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-black text-[#4A2306] mb-2 font-[family-name:var(--font-nunito)]">
                      Đã gửi thành công!
                    </h3>
                    <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
                      {successMessage}
                    </p>
                  </div>
                ) : (
                  <CareerApplicationForm
                    key={selectedJobId}
                    initialJobId={selectedJobId}
                    positions={jobs.map(({ id, title }) => ({ id, title }))}
                    onSuccess={setSuccessMessage}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
