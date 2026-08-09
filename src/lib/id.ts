// 新しいアクション/動画などにユニークIDを振るための小さなユーティリティ
export function generateId(prefix?: string): string {
  const raw = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return prefix ? `${prefix}-${raw}` : raw;
}
