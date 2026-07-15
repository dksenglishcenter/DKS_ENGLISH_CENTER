"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/components/ui/utils";

type CourseCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function optimizeSrc(src: string) {
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    return src.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1200/");
  }
  return src;
}

export function CourseCoverImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: CourseCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={cn("absolute inset-0 bg-secondary", className)} aria-hidden="true" />;
  }

  return (
    <Image
      src={optimizeSrc(src)}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover bg-secondary", className)}
      onError={() => setFailed(true)}
      unoptimized={src.includes("images.unsplash.com")}
    />
  );
}
