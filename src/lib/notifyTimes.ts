// リマインド通知で選べる時間帯（日本時間）
export const NOTIFY_TIME_SLOTS = ["07:00", "09:00", "12:00", "18:00", "21:00"] as const;
export type NotifyTimeSlot = (typeof NOTIFY_TIME_SLOTS)[number];

export const DEFAULT_NOTIFY_TIMES: NotifyTimeSlot[] = ["09:00"];

export function isValidNotifyTime(value: unknown): value is NotifyTimeSlot {
  return typeof value === "string" && (NOTIFY_TIME_SLOTS as readonly string[]).includes(value);
}

export function sanitizeNotifyTimes(value: unknown): NotifyTimeSlot[] {
  if (!Array.isArray(value)) return DEFAULT_NOTIFY_TIMES;
  const filtered = value.filter(isValidNotifyTime);
  return filtered.length > 0 ? filtered : DEFAULT_NOTIFY_TIMES;
}
