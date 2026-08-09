"use client";

import { useState } from "react";
import { HeartHandshake, Link2 } from "lucide-react";
import TabNav, { TabKey } from "@/components/TabNav";
import TaskCard from "@/components/TaskCard";
import VideoPlayer from "@/components/VideoPlayer";
import PraiseModal from "@/components/PraiseModal";
import RecordTimeline from "@/components/RecordTimeline";
import WishListModal from "@/components/WishListModal";
import LineSyncPanel from "@/components/LineSyncPanel";
import CloudSyncManager from "@/components/CloudSyncManager";
import { useLocalRecords } from "@/hooks/useLocalRecords";
import { getRandomMilestonePraise, getRandomPraise } from "@/data/praises";
import { isMilestoneCount } from "@/lib/milestones";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("home");
  const { records, addRecord, clearRecords } = useLocalRecords();

  const [isPraiseOpen, setIsPraiseOpen] = useState(false);
  const [praiseMessage, setPraiseMessage] = useState("");
  const [completedTaskName, setCompletedTaskName] = useState("");
  const [milestoneCount, setMilestoneCount] = useState<number | null>(null);
  const [isWishListOpen, setIsWishListOpen] = useState(false);
  const [isLineSyncOpen, setIsLineSyncOpen] = useState(false);

  function handleComplete(taskName: string) {
    const newCount = records.length + 1;
    const milestone = isMilestoneCount(newCount);

    addRecord(taskName);
    setCompletedTaskName(taskName);
    setPraiseMessage(milestone ? getRandomMilestonePraise() : getRandomPraise());
    setMilestoneCount(milestone ? newCount : null);
    setIsPraiseOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <header className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <HeartHandshake size={24} className="text-rose-400" />
          <h1 className="text-lg font-extrabold tracking-wide text-stone-700 sm:text-xl">
            やわらかアクション（仮）
          </h1>
        </div>
        <p className="text-sm text-stone-400">
          小さな一歩を選んで、思いきり自分を褒めてあげよう
        </p>
      </header>

      <div className="mb-8">
        <TabNav active={tab} onChange={setTab} />
      </div>

      <main className="w-full max-w-xl animate-float-in">
        {tab === "home" ? (
          <div className="flex flex-col gap-6">
            <TaskCard onComplete={handleComplete} />
            <VideoPlayer onComplete={handleComplete} />
          </div>
        ) : (
          <RecordTimeline records={records} onClear={clearRecords} />
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
          className="flex items-center gap-1.5 text-stone-300 underline-offset-4 transition-colors hover:text-emerald-500 hover:underline"
        >
          <Link2 size={14} />
          LINEと連携する（データ保存・通知）
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

      <LineSyncPanel isOpen={isLineSyncOpen} onClose={() => setIsLineSyncOpen(false)} />

      <CloudSyncManager />
    </div>
  );
}
