export function UnsplashImage({
  id,
  alt,
  className = "",
}: {
  id: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={`https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&auto=format`}
      alt={alt}
      className={`object-cover bg-secondary ${className}`}
      loading="lazy"
    />
  );
}
