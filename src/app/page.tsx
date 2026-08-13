"use client";

import { useEffect, useRef, useState } from "react";
import { Cloud, HeartHandshake } from "lucide-react";
import TabNav, { TabKey } from "@/components/TabNav";
import TaskCard from "@/components/TaskCard";
import VideoPlayer from "@/components/VideoPlayer";
import PraiseModal from "@/components/PraiseModal";
import RecordTimeline from "@/components/RecordTimeline";
import WishListModal from "@/components/WishListModal";
import LineSyncPanel from "@/components/LineSyncPanel";
import CloudSyncManager from "@/components/CloudSyncManager";
import { useLocalRecords } from "@/hooks/useLocalRecords";
import { useTaskBoard } from "@/hooks/useTaskBoard";
import { useEditableVideos } from "@/hooks/useEditableVideos";
import { useVideoBoard } from "@/hooks/useVideoBoard";
import { getRandomMilestonePraise, getRandomPraise } from "@/data/praises";
import { isMilestoneCount } from "@/lib/milestones";
import { RecordEntry, RecordSource } from "@/types";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("home");
  const { records, addRecord, clearRecords } = useLocalRecords();
  const { selectTask } = useTaskBoard();
  const { videos } = useEditableVideos();
  const { selectVideoById } = useVideoBoard(videos);
  const [repeatNotice, setRepeatNotice] = useState<string | null>(null);
  const [scrollToVideoSignal, setScrollToVideoSignal] = useState(0);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  const [isPraiseOpen, setIsPraiseOpen] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState("");
  const [completedTaskName, setCompletedTaskName] = useState("");
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null);
  const [isWishListOpen, setIsWishListOpen] = useState(false);
  const [isLineSyncOpen, setIsLineSyncOpen] = useState(false);
  const [justLinked, setJustLinked] = useState(false);

  // LINEログインから戻ってきたときは、データ保存・通知のポップアップを開いた状態にする
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked") === "1") {
      setIsLineSyncOpen(true);
      setJustLinked(true);
      params.delete("linked");
      const rest = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));
    }
  }, []);

  function handleComplete(taskName: string, source?: RecordSource) {
    const newCount = records.length + 1;
    const milestone = isMilestoneCount(newCount);

    addRecord(taskName, source);
    setCompletedTaskName(taskName);
    setPraiseMessage(milestone ? getRandomMilestonePraise() : getRandomPraise());
    setMilestoneCount(milestone ? newCount : null);
    setIsPraiseOpen(true);
  }

  // きろく画面の記録から、そのアクション/動画をもう一度表示する
  function handleRepeat(entry: RecordEntry) {
    if (!entry.source) return;
    const ok =
      entry.source.type === "task"
        ? selectTask(entry.source.id)
        : selectVideoById(entry.source.id);
    if (!ok) {
      setRepeatNotice("そのアクションは編集で消えているみたいです");
      return;
    }
    setTab("home");
    if (entry.source.type === "video") {
      setScrollToVideoSignal((n) => n + 1);
    }
  }

  useEffect(() => {
    if (!repeatNotice) return;
    const timer = setTimeout(() => setRepeatNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [repeatNotice]);

  // 動画をもう一度表示するタイミングで、動画のところまで自動スクロールする
  useEffect(() => {
    if (scrollToVideoSignal === 0) return;
    videoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollToVideoSignal]);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <HeartHandshake size={24} className="text-rose-400" />
          <h1 className="text-lg font-extrabold tracking-wide text-stone-700 sm:text-xl">
            やわらかアクション v1.0
          </h1>
        </div>
        <p className="text-sm text-stone-400">
          自分にやさしく、小さな一歩を
        </p>
      </header>

      <div className="mb-8">
        <TabNav active={tab} onChange={setTab} />
      </div>

      <main className="w-full max-w-xl animate-float-in">
        {tab === "home" ? (
          <div className="flex flex-col gap-6">
            <TaskCard onComplete={handleComplete} />
            <div ref={videoSectionRef}>
              <VideoPlayer onComplete={handleComplete} />
            </div>
          </div>
        ) : (
          <RecordTimeline records={records} onClear={clearRecords} onRepeat={handleRepeat} />
        )}
      </main>

      <button
        onClick={() => setIsWishListOpen(true)}
        className="mt-6 flex w-full max-w-xl items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 px-6 py-4 text-sm font-bold text-violet-500 shadow-sm ring-1 ring-violet-200/60 transition-all hover:-translate-y-0.5 hover:shadow-md hover:from-violet-200 hover:to-fuchsia-200 active:translate-y-0"
      >
        <span className="text-lg" aria-hidden="true">🌈</span>
        もっとできちゃう？（やりたいことリスト）
      </button>

      <footer className="mt-6 flex flex-col items-center gap-3 text-center text-xs text-stone-300">
        {records.length > 0
          ? `これまでに ${records.length} 回、がんばった自分を記録してきました 🌱`
          : "がんばりは、ぜんぶここに積み重なっていきます 🌱"}

        <button
          onClick={() => setIsLineSyncOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-200/60 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md active:translate-y-0"
        >
          <Cloud size={16} />
          データ保存・通知
        </button>
      </footer>

      <PraiseModal
        isOpen={isPraiseOpen}
        message={praiseMessage}
        taskName={completedTaskName}
        milestoneCount={milestoneCount}
        onClose={() => setIsPraiseOpen(false)}
      />

      <WishListModal
        isOpen={isWishListOpen}
        onClose={() => setIsWishListOpen(false)}
        onComplete={handleComplete}
      />

      <LineSyncPanel
        isOpen={isLineSyncOpen}
        onClose={() => {
          setIsLineSyncOpen(false);
          setJustLinked(false);
        }}
        justLinked={justLinked}
      />

      <CloudSyncManager />

      {repeatNotice && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <p className="rounded-full bg-stone-800/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
            {repeatNotice}
          </p>
        </div>
      )}
    </div>
  );
}
