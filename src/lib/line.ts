import { messagingApi } from "@line/bot-sdk";

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

function getLineClient() {
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    throw new Error("LINE_MESSAGING_CHANNEL_ACCESS_TOKEN が設定されていません");
  }
  return new messagingApi.MessagingApiClient({ channelAccessToken });
}

export async function pushLineMessage(lineUserId: string, text: string): Promise<void> {
  const client = getLineClient();
  await client.pushMessage({
    to: lineUserId,
    messages: [{ type: "text", text }],
  });
}
