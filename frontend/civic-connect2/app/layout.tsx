import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aapki Awaaz — Your voice reaches your MP",
  description:
    "Speak, snap, or type your civic problem. It reaches your MP's office automatically — no reading or typing required.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F7F4EC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body
        className={`${baloo.variable} ${inter.variable} ${mono.variable} font-body bg-paper text-ink antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
