"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteMediaAsset,
  deleteMediaByPublicId,
  restoreMediaAsset,
  stashMediaAsset,
  uploadMediaAsset,
  type MediaCategory,
} from "@/lib/media/api";

type StashInfo = {
  originalPublicId: string;
  stashPublicId: string;
};

type UseCloudinaryImageReplaceOptions = {
  category: MediaCategory;
  /**
   * Persist URL mới ngay sau upload (preview site đúng khi đang sửa).
   * Truyền null/omit nếu chỉ commit khi bấm Lưu.
   */
  onLivePersist?: (url: string) => Promise<void>;
  /** Khi Hủy: ghi lại URL đã restore vào DB (nếu đã live-persist). */
  onLiveRestore?: (url: string) => Promise<void>;
};

/**
 * Stash ảnh cũ → upload mới → Hủy restore / Lưu destroy stash.
 * Dùng chung gallery, facilities, teachers, vision, course-cover.
 */
export function useCloudinaryImageReplace({
  category,
  onLivePersist,
  onLiveRestore,
}: UseCloudinaryImageReplaceOptions) {
  const savedUrlRef = useRef<string | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const stashRef = useRef<StashInfo | null>(null);
  const [uploading, setUploading] = useState(false);

  const livePersistRef = useRef(onLivePersist);
  const liveRestoreRef = useRef(onLiveRestore);
  livePersistRef.current = onLivePersist;
  liveRestoreRef.current = onLiveRestore;

  const reset = useCallback((savedUrl: string | null = null) => {
    savedUrlRef.current = savedUrl;
    pendingUrlRef.current = null;
    stashRef.current = null;
  }, []);

  const discard = useCallback(async () => {
    const pending = pendingUrlRef.current;
    const stash = stashRef.current;
    const savedUrl = savedUrlRef.current;

    pendingUrlRef.current = null;
    stashRef.current = null;

    if (pending && pending !== savedUrl) {
      try {
        await deleteMediaAsset(pending);
      } catch {
        // best-effort
      }
    }

    if (stash) {
      try {
        const restored = await restoreMediaAsset({
          stashPublicId: stash.stashPublicId,
          originalPublicId: stash.originalPublicId,
        });
        if (liveRestoreRef.current) {
          await liveRestoreRef.current(restored.url);
        }
        return restored.url;
      } catch {
        return savedUrl;
      }
    }

    return savedUrl;
  }, []);

  const commit = useCallback(async (savedUrl?: string) => {
    const stash = stashRef.current;
    if (stash) {
      try {
        await deleteMediaByPublicId(stash.stashPublicId);
      } catch {
        // best-effort
      }
    }
    pendingUrlRef.current = null;
    stashRef.current = null;
    if (savedUrl) savedUrlRef.current = savedUrl;
  }, []);

  const upload = useCallback(
    async (file: File | null): Promise<string | null> => {
      if (!file) return null;
      setUploading(true);
      try {
        const previousPending = pendingUrlRef.current;
        const saved = savedUrlRef.current;

        if (
          saved &&
          !stashRef.current &&
          saved.includes("res.cloudinary.com")
        ) {
          const stashed = await stashMediaAsset(saved);
          stashRef.current = {
            originalPublicId: stashed.originalPublicId,
            stashPublicId: stashed.stashPublicId,
          };
        }

        const uploaded = await uploadMediaAsset(file, { category });
        const url = uploaded.url;
        pendingUrlRef.current = url;

        if (livePersistRef.current) {
          await livePersistRef.current(url);
        }

        if (previousPending && previousPending !== saved) {
          try {
            await deleteMediaAsset(previousPending);
          } catch {
            // ignore
          }
        }

        return url;
      } finally {
        setUploading(false);
      }
    },
    [category],
  );

  useEffect(() => {
    return () => {
      void discard();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount orphan cleanup
  }, []);

  return {
    uploading,
    reset,
    discard,
    commit,
    upload,
    /** Đánh dấu URL đã lưu trong DB sau khi Lưu thành công. */
    markSaved: (url: string) => {
      savedUrlRef.current = url;
      pendingUrlRef.current = null;
      stashRef.current = null;
    },
  };
}
