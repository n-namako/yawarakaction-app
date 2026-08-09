export interface ActionTask {
  id: string;
  title: string;
  duration: string;
  emoji: string;
}

export type DurationKey = "3" | "5" | "10";

// 動画エクササイズ機能：時間だけでなく、対象の体の部位からも動画を選べるようにするための分類
export type BodyPartKey = "shoulder" | "back" | "hip" | "fullbody";

export interface ExerciseVideo {
  id: string;
  title: string;
  /**
   * ダミーデータ用のYouTube動画ID。
   * 実際の動画に差し替える場合は、YouTubeのURLの `v=` の後ろの文字列をここに入れてください。
   * 例: https://www.youtube.com/watch?v=XXXXXXXXXXX → "XXXXXXXXXXX"
   * nullのままだと「準備中」カードが表示され、検索リンクへ遷移できます。
   */
  youtubeId: string | null;
  duration: DurationKey;
  bodyPart: BodyPartKey;
}

export interface RecordEntry {
  id: string;
  taskName: string;
  completedAt: string; // ISO文字列
}

// 「もっとできちゃう」機能：急がないけど自分のためにいつかやりたいことのメモ
export interface WishItem {
  id: string;
  title: string;
  createdAt: string; // ISO文字列
}
