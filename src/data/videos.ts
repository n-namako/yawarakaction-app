import { BodyPartKey, DurationKey, ExerciseVideo } from "@/types";

export const DURATION_OPTIONS: { key: DurationKey; label: string; emoji: string }[] = [
  { key: "3", label: "3分", emoji: "⚡" },
  { key: "5", label: "5分", emoji: "🌤️" },
  { key: "10", label: "10分以上", emoji: "🌳" },
];

export const BODY_PART_OPTIONS: { key: BodyPartKey; label: string; emoji: string }[] = [
  { key: "shoulder", label: "肩・首", emoji: "🙆" },
  { key: "back", label: "腰・背中", emoji: "🧍" },
  { key: "hip", label: "股関節・お尻", emoji: "🍑" },
  { key: "fullbody", label: "全身", emoji: "🔥" },
];

// 動画エクササイズ機能：デフォルトの動画リスト
// (ユーザーは画面上の編集機能でこのリストをカスタマイズできます。durationは
//  「3分/5分/10分以上」のうちどのボタンで提案されるかを表し、実際の動画の長さとは
//  多少ズレることがあります＝手持ち時間に対して無理のない範囲で振り分けています)
export const EXERCISE_VIDEOS: ExerciseVideo[] = [
  {
    id: "v1",
    title: "肩こり・首こり・腰痛スッキリストレッチ",
    youtubeId: "rVVbuNMLcN8",
    duration: "3",
    bodyPart: "shoulder",
  },
  {
    id: "v2",
    title: "腰痛・首こり・肩こりまとめて解消ストレッチ",
    youtubeId: "bzGMeDoGpeA",
    duration: "10",
    bodyPart: "back",
  },
  {
    id: "v3",
    title: "座ったまま全身シェイプ筋トレ",
    youtubeId: "MyKtNBYl5_0",
    duration: "5",
    bodyPart: "fullbody",
  },
  {
    id: "v4",
    title: "座ったまま背中スッキリトレーニング",
    youtubeId: "fy6HF5UuA2c",
    duration: "3",
    bodyPart: "back",
  },
  {
    id: "v5",
    title: "肩・首すっきりストレッチ",
    youtubeId: "bY6NETUVKEU",
    duration: "5",
    bodyPart: "shoulder",
  },
  {
    id: "v6",
    title: "滝汗ボクシングエクササイズ",
    youtubeId: "TSSpm8wp8ns",
    duration: "5",
    bodyPart: "fullbody",
  },
  {
    id: "v7",
    title: "ノリノリ有酸素ボクシング",
    youtubeId: "wI_fOlhQRRk",
    duration: "3",
    bodyPart: "fullbody",
  },
  {
    id: "v8",
    title: "パンチ＆キックでストレス発散",
    youtubeId: "g7KSIpPAAj4",
    duration: "10",
    bodyPart: "fullbody",
  },
  {
    id: "v9",
    title: "寝ながらお尻ストレッチ",
    youtubeId: "lThvx08en4s",
    duration: "5",
    bodyPart: "hip",
  },
  {
    id: "v10",
    title: "股関節やわらかストレッチ",
    youtubeId: "-Y5bOC_ecB0",
    duration: "10",
    bodyPart: "hip",
  },
];

function pickRandom(candidates: ExerciseVideo[], excludeId?: string): ExerciseVideo | null {
  if (candidates.length === 0) return null;
  const filtered = candidates.filter((v) => v.id !== excludeId);
  const pool = filtered.length > 0 ? filtered : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomVideoByDuration(
  videos: ExerciseVideo[],
  duration: DurationKey,
  excludeId?: string
): ExerciseVideo | null {
  return pickRandom(videos.filter((v) => v.duration === duration), excludeId);
}

export function getRandomVideoByBodyPart(
  videos: ExerciseVideo[],
  bodyPart: BodyPartKey,
  excludeId?: string
): ExerciseVideo | null {
  return pickRandom(videos.filter((v) => v.bodyPart === bodyPart), excludeId);
}
