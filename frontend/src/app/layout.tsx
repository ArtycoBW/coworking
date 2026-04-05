import type { Metadata } from "next";
import { Inter, Space_Mono, Space_Grotesk, Chakra_Petch } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-tech",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Garage Coworking",
    template: "%s | Garage Coworking",
  },
  description:
    "Платформа для бронирования рабочих мест, переговорных и управления коворкингом Garage при ДГТУ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn(
        inter.variable,
        spaceMono.variable,
        spaceGrotesk.variable,
        chakraPetch.variable,
        "dark h-full",
      )}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
