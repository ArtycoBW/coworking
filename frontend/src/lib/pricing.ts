import type { SpaceType } from "@/types";

export const RATES: Record<SpaceType, number> = {
  DESK: 200,          // ₽/ч
  MEETING_ROOM: 800,  // ₽/ч
};

export function calcTotal(type: SpaceType, startTime: Date, endTime: Date): number {
  const hours = (endTime.getTime() - startTime.getTime()) / 3_600_000;
  return Math.round(RATES[type] * hours);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("ru-RU") + " ₽";
}
