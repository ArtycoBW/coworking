import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ассистент ARIA",
  description: "Спроси ARIA о свободных местах, бронированиях и правилах коворкинга.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
