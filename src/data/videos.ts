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
  { key: "abdomen", label: "おなか", emoji: "🍥" },
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
    id: "v4",
    title: "座ったまま背中スッキリトレーニング",
    youtubeId: "fy6HF5UuA2c",
    duration: "3",
    bodyPart: "back",
  },
  {
    id: "v6",
    title: "滝汗ボクシング",
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
  {
    id: "v11",
    title: "巻き肩リセットフォームローラー",
    youtubeId: "vKAM1rR1yNw",
    duration: "10",
    bodyPart: "shoulder",
  },
  {
    id: "v12",
    title: "おなかすっきりエクササイズ",
    youtubeId: "u7lslrolYPw",
    duration: "5",
    bodyPart: "abdomen",
  },
  {
    id: "v13",
    title: "お尻をフォームローラーでほぐす",
    youtubeId: "asMUioK5jLo",
    duration: "3",
    bodyPart: "hip",
  },
  {
    id: "v14",
    title: "ストレートネック改善",
    youtubeId: "ieql6lyRWIY",
    duration: "10",
    bodyPart: "shoulder",
  },
  {
    id: "v15",
    title: "ラジオ体操第一",
    youtubeId: "re-PodR7_-c",
    duration: "5",
    bodyPart: "fullbody",
  },
  {
    id: "v16",
    title: "ぺたんこお腹エクササイズ",
    youtubeId: "Hi3H66lWSnE",
    duration: "3",
    bodyPart: "abdomen",
  },
  {
    id: "v17",
    title: "全身しっかりエクササイズ",
    youtubeId: "hge3fr50o0o",
    duration: "10",
    bodyPart: "fullbody",
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
