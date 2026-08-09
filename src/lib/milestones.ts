// 「キリのいい回数」を判定するユーティリティ。達成回数がこれに当たると特別な演出を出す。
const FIXED_MILESTONES = [5, 10, 20, 30, 50, 75, 100];

export function isMilestoneCount(count: number): boolean {
  if (count <= 0) return false;
  if (FIXED_MILESTONES.includes(count)) return true;
  // 100回以降は100回ごとに特別演出（200, 300, 400...）
  return count > 100 && count % 100 === 0;
}
