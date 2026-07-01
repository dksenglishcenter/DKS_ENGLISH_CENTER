import type { Metadata } from "next";

import { getRootMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema } from "@/lib/seo/schemas";

import "./globals.css";

export const metadata: Metadata = getRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full">
        <JsonLd data={organizationSchema()} />
        {children}
      </body>
    </html>
  );
}
