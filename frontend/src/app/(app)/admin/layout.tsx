import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Панель администратора",
  description: "Управление пользователями, бронированиями и пространствами.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
