import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход",
  description: "Войди в систему коворкинга Garage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
