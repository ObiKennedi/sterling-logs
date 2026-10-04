import type { Metadata, Viewport } from "next";
import "./globals.scss";
import { AOSInit } from "@/components/AOSInit";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Sterling Logs | Real & Organic Social Media Logs",
  description:
    "Buy logs for different social media platforms and get real and organic traffic to your website. No scams, just real traffic from real users.",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AOSInit />
      </body>
    </html>
  );
}
