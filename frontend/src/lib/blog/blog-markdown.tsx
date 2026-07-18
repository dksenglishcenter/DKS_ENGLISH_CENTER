import Image from "next/image";
import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

function isSafeHref(href: string | undefined): href is string {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Convert bare http(s) URLs to markdown links when not already inside `](...)`. */
function autolinkBareUrls(markdown: string): string {
  return markdown.replace(
    /(?<!\]\()(?<!\]:\s*)(https?:\/\/[^\s<]+[^\s<.,:;?!"')\]])/g,
    (url) => `[${url}](${url})`,
  );
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="leading-relaxed text-muted-foreground whitespace-pre-line">{children}</p>
  ),
  a: ({ href, children }) => {
    if (!isSafeHref(href)) {
      return <span>{children}</span>;
    }
    const external = href.startsWith("http");
    if (external) {
      return (
        <a
          href={href}
          className="font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
      >
        {children}
      </Link>
    );
  },
  img: ({ src, alt }) => {
    if (typeof src !== "string" || !isSafeHref(src)) return null;
    return (
      <span className="my-4 block overflow-hidden rounded-2xl border border-border bg-muted">
        <span className="relative block aspect-[16/10] w-full">
          <Image
            src={src}
            alt={alt?.trim() || "Ảnh minh họa"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 720px"
            unoptimized
          />
        </span>
      </span>
    );
  },
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
};

/**
 * Render blog section body as Markdown (links, images, paragraphs).
 * Raw HTML is not allowed by react-markdown default.
 */
export function BlogMarkdownBody({ content }: { content: string }) {
  const markdown = autolinkBareUrls(content.trim());
  if (!markdown) return null;

  return (
    <div className="space-y-4 [&_p+p]:mt-0">
      <ReactMarkdown
        components={markdownComponents}
        // Disallow raw HTML nodes explicitly
        skipHtml
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
