"use client";

import { useEffect, useRef, useState } from "react";

import { AboutFacilitiesAdmin } from "@/components/admin/about/about-facilities-admin";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { useCloudinaryImageReplace } from "@/hooks/use-cloudinary-image-replace";
import { getAboutContent, updateAboutContent } from "@/lib/about-content/api";
import { scrollToFirstInvalid } from "@/lib/admin/scroll";
import { formatError } from "@/lib/errors/format-error";
import { isHttpUrl } from "@/lib/media/is-http-url";

export function AboutAdmin() {
  const [visionUrl, setVisionUrl] = useState("");
  const [visionLoading, setVisionLoading] = useState(true);
  const [visionSaving, setVisionSaving] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [visionMessage, setVisionMessage] = useState<string | null>(null);
  const [visionDirty, setVisionDirty] = useState(false);
  const visionSectionRef = useRef<HTMLDivElement>(null);

  const visionImage = useCloudinaryImageReplace({
    category: "about-vision",
    onLivePersist: async (url) => {
      await updateAboutContent({ visionImageUrl: url });
    },
    onLiveRestore: async (url) => {
      await updateAboutContent({ visionImageUrl: url });
    },
  });

  const loadVision = async () => {
    setVisionLoading(true);
    setVisionError(null);
    try {
      const response = await getAboutContent();
      const url = response.content.visionImageUrl ?? "";
      setVisionUrl(url);
      visionImage.reset(url || null);
      setVisionDirty(false);
    } catch (err) {
      setVisionError(formatError(err));
    } finally {
      setVisionLoading(false);
    }
  };

  useEffect(() => {
    void loadVision();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  const handleVisionUpload = async (file: File | null) => {
    setVisionError(null);
    setVisionMessage(null);
    try {
      const url = await visionImage.upload(file);
      if (url) {
        setVisionUrl(url);
        setVisionDirty(true);
      }
    } catch (err) {
      setVisionError(formatError(err));
      scrollToFirstInvalid(visionSectionRef.current);
    }
  };

  const handleVisionSave = async () => {
    setVisionError(null);
    setVisionMessage(null);
    if (!isHttpUrl(visionUrl)) {
      setVisionError("Chưa có ảnh — vui lòng chọn ảnh rồi lưu");
      scrollToFirstInvalid(visionSectionRef.current);
      return;
    }

    setVisionSaving(true);
    try {
      await updateAboutContent({ visionImageUrl: visionUrl.trim() });
      await visionImage.commit(visionUrl.trim());
      setVisionDirty(false);
      setVisionMessage("Đã lưu ảnh tầm nhìn & sứ mệnh.");
      await loadVision();
    } catch (err) {
      setVisionError(formatError(err));
      scrollToFirstInvalid(visionSectionRef.current);
    } finally {
      setVisionSaving(false);
    }
  };

  const handleVisionCancel = async () => {
    const restored = await visionImage.discard();
    setVisionError(null);
    setVisionMessage(null);
    setVisionUrl(restored ?? "");
    setVisionDirty(false);
    visionImage.reset(restored ?? null);
  };

  return (
    <div className="space-y-10">
      <section ref={visionSectionRef} className="space-y-4 scroll-mt-6">
        <h2 className="text-2xl font-black text-foreground font-[family-name:var(--font-nunito)]">
          Tầm nhìn & Sứ mệnh
        </h2>
        <p className="text-sm text-muted-foreground">
          Ảnh minh họa khối tầm nhìn / sứ mệnh trên trang About.
        </p>

        {visionError ? <p className="text-sm text-red-600">{visionError}</p> : null}
        {visionMessage ? <p className="text-sm text-green-700">{visionMessage}</p> : null}
        {visionLoading ? <p className="text-sm text-muted-foreground">Đang tải...</p> : null}

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <AdminImageField
            url={visionUrl}
            uploading={visionImage.uploading || visionLoading}
            invalid={Boolean(visionError && !isHttpUrl(visionUrl))}
            error={visionError && !isHttpUrl(visionUrl) ? visionError : undefined}
            onFile={(file) => void handleVisionUpload(file)}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={
                visionSaving ||
                visionImage.uploading ||
                visionLoading ||
                !isHttpUrl(visionUrl) ||
                !visionDirty
              }
              onClick={() => void handleVisionSave()}
            >
              {visionImage.uploading
                ? "Đang upload..."
                : visionSaving
                  ? "Đang lưu..."
                  : "Lưu"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={visionSaving || visionImage.uploading}
              onClick={() => void handleVisionCancel()}
            >
              Hủy
            </Button>
          </div>
        </div>
      </section>

      <AboutFacilitiesAdmin />
    </div>
  );
}
