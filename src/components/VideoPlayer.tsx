"use client";

import { useState } from "react";
import { ArrowLeft, PlayCircle, RefreshCw, Search, SquarePen, Timer } from "lucide-react";
import {
  BODY_PART_OPTIONS,
  DURATION_OPTIONS,
  getRandomVideoByBodyPart,
  getRandomVideoByDuration,
} from "@/data/videos";
import { useEditableVideos } from "@/hooks/useEditableVideos";
import VideoListEditor from "@/components/VideoListEditor";
import { BodyPartKey, DurationKey, ExerciseVideo } from "@/types";

interface VideoPlayerProps {
  onComplete: (videoTitle: string) => void;
}

type FilterMode = "duration" | "bodyPart";

export default function VideoPlayer({ onComplete }: VideoPlayerProps) {
  const { videos, addVideo, updateVideo, removeVideo, resetVideos } = useEditableVideos();
  const [filterMode, setFilterMode] = useState<FilterMode>("duration");
  const [duration, setDuration] = useState<DurationKey | null>(null);
  const [bodyPart, setBodyPart] = useState<BodyPartKey | null>(null);
  const [video, setVideo] = useState<ExerciseVideo | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isSelecting = !duration && !bodyPart;

  function handleSelectDuration(key: DurationKey) {
    setDuration(key);
    setVideo(getRandomVideoByDuration(videos, key));
  }

  function handleSelectBodyPart(key: BodyPartKey) {
    setBodyPart(key);
    setVideo(getRandomVideoByBodyPart(videos, key));
  }

  function handleShuffleVideo() {
    if (duration) {
      setVideo((current) => getRandomVideoByDuration(videos, duration, current?.id));
    } else if (bodyPart) {
      setVideo((current) => getRandomVideoByBodyPart(videos, bodyPart, current?.id));
    }
  }

  function handleBack() {
    setDuration(null);
    setBodyPart(null);
    setVideo(null);
  }

  function handleComplete() {
    if (!video) return;
    onComplete(video.title);
    handleBack();
  }

  const backLabel = duration ? "時間をえらびなおす" : "部位をえらびなおす";
  const emptyLabel = duration ? "この時間の動画がまだありません。" : "この部位の動画がまだありません。";

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

      {isSelecting && (
        <div className="flex flex-col items-center gap-4">
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
            <>
              <p className="text-center text-stone-500">どのくらいの時間、動けそう？</p>
              <div className="flex flex-wrap justify-center gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectDuration(option.key)}
                    className="flex min-w-[7.5rem] flex-col items-center gap-1 rounded-2xl bg-sky-50 px-6 py-4 font-bold text-sky-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-md active:translate-y-0"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-stone-500">どこを動かしたい？</p>
              <div className="flex flex-wrap justify-center gap-3">
                {BODY_PART_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSelectBodyPart(option.key)}
                    className="flex min-w-[7.5rem] flex-col items-center gap-1 rounded-2xl bg-sky-50 px-6 py-4 font-bold text-sky-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-100 hover:shadow-md active:translate-y-0"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!isSelecting && video && (
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 self-start text-sm font-bold text-stone-400 transition-colors hover:text-stone-600"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>

          <h3 className="text-center text-2xl font-extrabold text-stone-700">{video.title}</h3>

          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-stone-100 shadow-inner">
            {video.youtubeId ? (
              <iframe
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
      )}

      {!isSelecting && !video && (
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 self-start text-sm font-bold text-stone-400 transition-colors hover:text-stone-600"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
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
