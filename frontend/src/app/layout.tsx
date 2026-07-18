import type { Metadata } from "next";

import { getRootMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { ThirdPartyScripts } from "@/components/seo/third-party-scripts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { organizationSchema } from "@/lib/seo/schemas";

import "./globals.css";

export const metadata: Metadata = getRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <JsonLd data={organizationSchema()} />
          {children}
          <ThirdPartyScripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
