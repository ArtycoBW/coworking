import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "История броней",
  description: "История всех твоих бронирований в коворкинге Garage.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
