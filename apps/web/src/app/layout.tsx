import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

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
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
