import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Твой профиль, статистика и настройки аккаунта.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
