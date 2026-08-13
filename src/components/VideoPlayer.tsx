"use client";

import { useEffect, useState } from "react";
import { PlayCircle, RefreshCw, Search, SquarePen, Timer, X } from "lucide-react";
import { BODY_PART_OPTIONS, DURATION_OPTIONS } from "@/data/videos";
import { useEditableVideos } from "@/hooks/useEditableVideos";
import { useVideoBoard } from "@/hooks/useVideoBoard";
import VideoListEditor from "@/components/VideoListEditor";
import { RecordSource } from "@/types";

interface VideoPlayerProps {
  onComplete: (videoTitle: string, source?: RecordSource) => void;
}

type FilterMode = "duration" | "bodyPart";

export default function VideoPlayer({ onComplete }: VideoPlayerProps) {
  const { videos, addVideo, updateVideo, removeVideo, resetVideos } = useEditableVideos();
  const {
    duration,
    bodyPart,
    video,
    selectDuration: handleSelectDuration,
    selectBodyPart: handleSelectBodyPart,
    shuffle: handleShuffleVideo,
    back: handleBack,
    selectRandom,
  } = useVideoBoard(videos);
  const [filterMode, setFilterMode] = useState<FilterMode>("duration");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // YouTube側やブラウザに一度出てからアプリに戻ってきた時、埋め込み動画が
  // 固まって再読み込みされないことがあるため、戻ってきたタイミングでiframeを強制的に作り直す
  const [reloadToken, setReloadToken] = useState(0);

  const isFiltered = !!duration || !!bodyPart;

  // メインのアクションと同じく、最初から1つおまかせで表示しておく
  // （時間・部位どちらも絞り込んでおらず、まだ何も表示されていない時だけ発動）
  useEffect(() => {
    if (video || duration || bodyPart) return;
    if (videos.length === 0) return;
    selectRandom();
  }, [video, duration, bodyPart, videos, selectRandom]);

  useEffect(() => {
    function handleReturnToApp() {
      if (document.visibilityState === "visible") {
        setReloadToken((n) => n + 1);
      }
    }
    function handlePageShow(event: PageTransitionEvent) {
      // bfcache（戻る操作でページがそのまま復元される場合）から戻ってきた時も対象にする
      if (event.persisted) {
        setReloadToken((n) => n + 1);
      }
    }
    document.addEventListener("visibilitychange", handleReturnToApp);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleReturnToApp);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  function handleComplete() {
    if (!video) return;
    onComplete(video.title, { type: "video", id: video.id });
    handleShuffleVideo();
  }

  const emptyLabel = isFiltered
    ? duration
      ? "この時間の動画がまだありません。"
      : "この部位の動画がまだありません。"
    : "動画がありません。";

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur-sm transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)] sm:p-10">
      <div className="mb-5 flex items-center justify-center gap-2 text-sky-400">
        <Timer size={18} />
        <p className="text-sm font-bold tracking-wide">動画でからだを動かそう</p>
        <Timer size={18} />
        <button
          onClick={() => setIsEditorOpen(true)}
          aria-label="動画を編集"
          className="ml-1 text-stone-300 transition-colors hover:text-sky-400"
        >
          <SquarePen size={16} />
        </button>
      </div>

      {video ? (
        <div className="flex flex-col items-center gap-4">
          {isFiltered && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 self-start text-xs font-bold text-stone-400 transition-colors hover:text-stone-600"
            >
              <X size={14} />
              絞り込みを解除しておまかせに戻す
            </button>
          )}

          <h3 className="text-center text-2xl font-extrabold text-stone-700">{video.title}</h3>

          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
            {video.youtubeId ? (
              <iframe
                key={`${video.id}-${reloadToken}`}
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  video.title
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400 transition-colors hover:text-sky-500"
              >
                <PlayCircle size={48} />
                <span className="text-sm font-bold">サンプル動画（準備中）</span>
                <span className="flex items-center gap-1 text-xs">
                  <Search size={12} />
                  YouTubeで探してみる
                </span>
              </a>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleComplete}
              className="w-full rounded-2xl bg-gradient-to-br from-sky-300 to-cyan-300 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm sm:w-auto"
            >
              できた！
            </button>
            <button
              onClick={handleShuffleVideo}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-6 py-4 text-sm font-bold text-stone-500 transition-all hover:-translate-y-0.5 hover:bg-stone-200 active:translate-y-0 sm:w-auto"
            >
              <RefreshCw size={16} />
              べつの動画にする
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          {isFiltered && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 self-start text-xs font-bold text-stone-400 transition-colors hover:text-stone-600"
            >
              <X size={14} />
              絞り込みを解除しておまかせに戻す
            </button>
          )}
          <p className="text-stone-400">
            {emptyLabel}
            <br />
            編集からお好きな動画を追加してください。
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="rounded-2xl bg-sky-300 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-400"
          >
            動画を追加する
          </button>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-stone-100 pt-5">
          <p className="text-xs font-bold text-stone-400">時間や部位で絞り込むこともできるよ</p>
          <div className="flex gap-1 rounded-full bg-stone-100 p-1">
            <button
              onClick={() => setFilterMode("duration")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                filterMode === "duration"
                  ? "bg-white text-sky-500 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              ⏱ 時間で選ぶ
            </button>
            <button
              onClick={() => setFilterMode("bodyPart")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                filterMode === "bodyPart"
                  ? "bg-white text-sky-500 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              🧘 部位で選ぶ
            </button>
          </div>

          {filterMode === "duration" ? (
            <div className="flex flex-wrap justify-center gap-3">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSelectDuration(option.key)}
                  className={`flex min-w-[7.5rem] flex-col items-center gap-1 rounded-2xl px-6 py-4 font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
                    duration === option.key
                      ? "bg-sky-400 text-white"
                      : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {BODY_PART_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSelectBodyPart(option.key)}
                  className={`flex min-w-[7.5rem] flex-col items-center gap-1 rounded-2xl px-6 py-4 font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
                    bodyPart === option.key
                      ? "bg-sky-400 text-white"
                      : "bg-sky-50 text-sky-600 hover:bg-sky-100"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <VideoListEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        videos={videos}
        onAdd={addVideo}
        onUpdate={updateVideo}
        onRemove={removeVideo}
        onReset={resetVideos}
      />
    </section>
  );
}
