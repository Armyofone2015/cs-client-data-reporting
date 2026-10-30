import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Client Data Reporting",
  description: "Invite-only client activity reporting portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
