// 毎日のリマインドで使う、気軽な一声のリスト
const REMINDER_MESSAGES: string[] = [
  "今日も少しだけ、自分のために動いてみない？🌱",
  "1分でもOK。次は何に挑戦する？☺️",
  "ちょっとだけ、自分をいたわる時間にしよう🍃",
  "生きてるだけで十分えらいけど、さらに…!?✨",
  "深呼吸ひとつでもいい。気分転換しよう🌬️",
];

export function getRandomReminderMessage(): string {
  return REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
}
