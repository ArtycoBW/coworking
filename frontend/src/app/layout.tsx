import type { Metadata } from "next";
import { Inter, Space_Mono, Syne } from "next/font/google";
import { cn } from "@/lib/utils";
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

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["700", "800"],
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
        syne.variable,
        "dark h-full",
      )}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
