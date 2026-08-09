// "3分" や "1.5分" のような時間ベースの所要時間から秒数を取り出す。
// "5回" のような回数ベースの表記はタイマー対象外としてnullを返す。
export function parseDurationToSeconds(duration: string): number | null {
  const trimmed = duration.trim();

  const minuteMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*分/);
  if (minuteMatch) {
    const seconds = Math.round(parseFloat(minuteMatch[1]) * 60);
    return seconds > 0 ? seconds : null;
  }

  const secondMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*秒/);
  if (secondMatch) {
    const seconds = Math.round(parseFloat(secondMatch[1]));
    return seconds > 0 ? seconds : null;
  }

  return null;
}

export function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
