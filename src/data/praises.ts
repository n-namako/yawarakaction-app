// 全力で褒める機能：ランダムに表示する褒め言葉のリスト
export const PRAISE_MESSAGES: string[] = [
  "えらい！",
  "今日も最高！",
  "少しでも動いててすごい！",
  "よくやった、自分！",
  "その調子〜！",
  "がんばったね、ほんとに！",
  "完璧じゃなくていい、それが最高！",
  "今のあなた、輝いてるよ！",
  "一歩踏み出せただけで100点！",
  "続けてるだけで才能！",
  "今日のあなたは合格！",
  "小さな一歩、大きな価値！",
];

export function getRandomPraise(): string {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
}

// キリのいい達成回数（5回、10回、20回…）の時だけ出す、特別な褒め言葉
export const MILESTONE_PRAISE_MESSAGES: string[] = [
  "これは特別な瞬間！",
  "積み重ねてきたね、最高！",
  "ここまで来られたの、すごすぎる！",
  "キリのいい数字、おめでとう！",
  "今のあなた、伝説級！",
  "積み重ねの力、証明されたね！",
];

export function getRandomMilestonePraise(): string {
  return MILESTONE_PRAISE_MESSAGES[Math.floor(Math.random() * MILESTONE_PRAISE_MESSAGES.length)];
}
