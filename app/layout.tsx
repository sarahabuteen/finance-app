import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const publicSans = localFont({
  src: [
    {
      path: "./fonts/PublicSans-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/PublicSans-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Finance",
  description: "Personal finance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
