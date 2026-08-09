// 全力で褒める機能：ランダムに表示する褒め言葉のリスト
export const PRAISE_MESSAGES: string[] = [
  "えらい！",
  "今日も最高！",
  "少しでも動いててすごい！",
  "自分に拍手！",
  "その調子〜！",
  "がんばってるね、応援してるよ！",
  "完璧じゃなくていい、それが最高！",
  "今のあなた、輝いてるよ！",
  "一歩踏み出せただけで100点！",
  "続けてるだけで才能！",
  "今日のあなたはハナマル！",
  "小さな一歩、大きな価値！",
  "えらすぎ君、爆誕！",
  "無理せず楽しもうね！",
  "でーきたできた♪できたできた♪ハイ！ハイ！ハイ！",
  "すばらしい！次は何する？",
  "いいねいいね！",
  "さらなる高みへ…Together",
  "商店街のみんなも応援してるよ！",
  "ナイスアクション！",
];

export function getRandomPraise(): string {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
}

// キリのいい達成回数（5回、10回、20回…）の時だけ出す、特別な褒め言葉
export const MILESTONE_PRAISE_MESSAGES: string[] = [
  "ワー！！特別な瞬間！",
  "続いてるね、素晴らしい！",
  "ここまで来られたの、すごすぎる！",
  "キリのいい数字、うれしくなっちゃうね",
  "世界中に発表したいね！",
  "積み重ねの力こそパワー！",
];

export function getRandomMilestonePraise(): string {
  return MILESTONE_PRAISE_MESSAGES[Math.floor(Math.random() * MILESTONE_PRAISE_MESSAGES.length)];
}
