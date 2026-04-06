import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Дашборд",
  description: "Забронируй рабочее место или переговорную в коворкинге Garage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
