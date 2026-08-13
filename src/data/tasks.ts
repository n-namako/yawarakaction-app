import { ActionTask } from "@/types";

// アクション提案機能：数分でできる小さなアクションのデフォルトリスト
// (ユーザーは画面上の編集機能でこのリストをカスタマイズできます。localStorageに保存された
//  カスタムリストがある場合はそちらが優先され、このリストは「デフォルトに戻す」時などに使われます)
export const ACTION_TASKS: ActionTask[] = [
  { id: "desk", title: "部屋の掃除", duration: "3分", emoji: "🧹" },
  { id: "squat", title: "スクワット", duration: "5回", emoji: "🏋️" },
  { id: "breath", title: "深呼吸", duration: "30秒", emoji: "🌬️" },
];

export function getRandomTask(tasks: ActionTask[], excludeId?: string): ActionTask | null {
  if (tasks.length === 0) return null;
  const candidates = tasks.filter((t) => t.id !== excludeId);
  const pool = candidates.length > 0 ? candidates : tasks;
  return pool[Math.floor(Math.random() * pool.length)];
}
