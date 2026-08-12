import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Book 05 Ch3 -- one display family, one UI family. Serif reads as
// heritage/hospitality; Inter carries body copy and UI at a legible size.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Ledger/typewriter register for the admin dashboard only -- booking IDs,
// dates, money, invoice numbers. Declared at the root (like the two fonts
// above) since next/font's self-hosted files only download when an element
// actually uses font-mono, so it costs nothing on the public-facing pages.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shangdhan Pine Homestay -- Lower Kaffer, Kalimpong",
  description:
    "Wake to Kanchenjunga turning to molten gold. A homestay in Lower Kaffer, Kalimpong district, West Bengal -- best seen February through March.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f4a3c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-text-primary">
        {children}
      </body>
    </html>
  );
}
