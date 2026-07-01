import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DKS English Center",
  description: "Học đúng cách – Tiến xa mỗi ngày",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
