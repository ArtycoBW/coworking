import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бронирование",
  description: "Выбери место и время — забронируй рабочее место или переговорную.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
