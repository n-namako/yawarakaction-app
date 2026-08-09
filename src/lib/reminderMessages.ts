// 毎日のリマインドで使う、気軽な一声のリスト
const REMINDER_MESSAGES: string[] = [
  "今日も少しだけ、自分のために動いてみない？🌱",
  "1分でもOK。今日のアクション、のぞいてみる？☺️",
  "ちょっとだけ、自分をいたわる時間にしよう🍃",
  "今日のあなたも、それだけで十分えらいよ✨",
  "深呼吸ひとつでもいい。今日も少し動いてみよう🌬️",
];

export function getRandomReminderMessage(): string {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}
