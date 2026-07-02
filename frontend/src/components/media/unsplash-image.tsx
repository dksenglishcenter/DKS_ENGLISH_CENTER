import Image from "next/image";

const UNSPLASH_HOST = "images.unsplash.com";

export function unsplashImageSrc(id: string, width = 800, height = 600) {
  return `https://${UNSPLASH_HOST}/photo-${id}?w=${width}&h=${height}&fit=crop&auto=format`;
}

type UnsplashImageProps = {
  id: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function UnsplashImage({
  id,
  alt,
  className = "",
  width = 800,
  height = 600,
  fill = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: UnsplashImageProps) {
  const src = unsplashImageSrc(id, width, height);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover bg-secondary ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`object-cover bg-secondary ${className}`}
    />
  );
}
