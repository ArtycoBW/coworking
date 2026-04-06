import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  description: "Создай аккаунт в системе коворкинга Garage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
