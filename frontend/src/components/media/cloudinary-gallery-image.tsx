"use client";

import Image from "next/image";
import { Camera, ImageOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/components/ui/utils";

type CloudinaryGalleryImageProps = {
  src: string;
  alt: string;
  sizes: string;
  objectPosition: string;
};

function cloudinaryOptimizedSrc(src: string) {
  return src.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1600/");
}

export function CloudinaryGalleryImage({
  src,
  alt,
  sizes,
  objectPosition,
}: CloudinaryGalleryImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const optimizedSrc = cloudinaryOptimizedSrc(src);

  const isLoaded = status === "loaded";
  const hasError = status === "error";

  return (
    <>
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-secondary"
          aria-hidden="true"
        >
          {hasError ? (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-sm font-semibold text-muted-foreground">
              <ImageOff className="h-7 w-7" aria-hidden="true" />
              <span>Ảnh chưa sẵn sàng</span>
            </div>
          ) : (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#fff8ef] via-[#f2e8de] to-[#fff3e5] motion-reduce:animate-none" />
          )}
        </div>
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectPosition }}
        className={cn(
          "object-cover bg-secondary transition-[opacity,transform] duration-500 motion-reduce:transition-none",
          isLoaded ? "opacity-100" : "opacity-0",
          isLoaded && "group-hover:scale-105",
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/30 motion-reduce:transition-none">
        <Camera className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden="true" />
      </span>
    </>
  );
}
