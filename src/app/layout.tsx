import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { ThemeProvider } from '@/components/ThemeProvider'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Dawam",
  description: "Daily routines and deadlines, in one place.",
  openGraph: {
    title: "Dawam",
    description: "Stay consistent, every day.",
    url: "https://dawam-tasks.vercel.app",
    images: [{ url: "/og_image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dawam",
    description: "Stay consistent, every day.",
    images: ["/og_image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}