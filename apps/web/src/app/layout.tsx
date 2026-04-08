import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CardBuy — Marketplace TCG",
    template: "%s | CardBuy",
  },
  description:
    "El marketplace de cartas coleccionables de confianza. Compra y vende Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece y más.",
  keywords: [
    "cartas coleccionables",
    "TCG",
    "Pokémon",
    "Magic the Gathering",
    "Yu-Gi-Oh",
    "marketplace",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CardBuy",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
