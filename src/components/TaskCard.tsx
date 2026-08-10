"use client";

import { useRef, useState } from "react";
import { RefreshCw, Sparkles, SquarePen } from "lucide-react";
import { useTaskBoard } from "@/hooks/useTaskBoard";
import TaskListEditor from "@/components/TaskListEditor";
import TaskTimer from "@/components/TaskTimer";
import { parseDurationToSeconds } from "@/lib/duration";
import { RecordSource } from "@/types";

interface TaskCardProps {
  onComplete: (taskName: string, source?: RecordSource) => void;
}

// 横スワイプと判定する最小距離(px)。指の震え程度では反応しないよう、ある程度余裕を持たせている
const SWIPE_THRESHOLD = 60;

export default function TaskCard({ onComplete }: TaskCardProps) {
  const { tasks, currentTask, shuffle, addTask, updateTask, removeTask, resetTasks } = useTaskBoard();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const timerSeconds = currentTask ? parseDurationToSeconds(currentTask.duration) : null;
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleComplete() {
    if (!currentTask) return;
    onComplete(`${currentTask.title}（${currentTask.duration}）`, { type: "task", id: currentTask.id });
    shuffle();
  }

  // 「べつのアクションにする」ボタンと同じ操作を、左右スワイプでもできるようにする
  function handlePointerDown(e: React.PointerEvent) {
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp(e: React.PointerEvent) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || !currentTask) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      shuffle();
    }
  }

  return (
    <section
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        swipeStartRef.current = null;
      }}
      className="rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur-sm transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.09)] sm:p-10">
      <div className="mb-5 flex items-center justify-center gap-2 text-rose-400">
        <Sparkles size={18} />
        <p className="text-sm font-bold tracking-wide">今すぐできること、ひとつだけ</p>
        <Sparkles size={18} />
        <button
          onClick={() => setIsEditorOpen(true)}
          aria-label="アクションを編集"
          className="ml-1 text-stone-300 transition-colors hover:text-rose-400"
        >
          <SquarePen size={16} />
        </button>
      </div>

      {currentTask ? (
        <>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-6xl sm:text-7xl">{currentTask.emoji}</span>
            <h2 className="text-3xl font-extrabold text-stone-700 sm:text-4xl">
              {currentTask.title}
            </h2>
            <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-600">
              {currentTask.duration}だけ
            </span>
          </div>

          {/* タイマーの有無で高さが変わり「できた！」ボタンの位置がアクションごとにブレないよう、常に同じ高さを確保しておく */}
          <div className="mt-[18px] flex min-h-[112px] flex-col items-center justify-center">
            {timerSeconds !== null ? (
              <TaskTimer key={currentTask.id} totalSeconds={timerSeconds} />
            ) : (
              <p className="text-sm text-stone-400">回数を目安に、無理なくやってみてね</p>
            )}
          </div>

          <div className="mt-[20px] flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleComplete}
              className="w-full rounded-2xl bg-gradient-to-br from-rose-300 to-orange-300 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm sm:w-auto"
            >
              できた！
            </button>
            <button
              onClick={shuffle}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-6 py-4 text-sm font-bold text-stone-500 transition-all hover:-translate-y-0.5 hover:bg-stone-200 active:translate-y-0 sm:w-auto"
            >
              <RefreshCw size={16} />
              べつのアクションにする
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-stone-400">
            アクションがありません。
            <br />
            編集からお好きなアクションを追加してください。
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="rounded-2xl bg-rose-300 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-rose-400"
          >
            アクションを追加する
          </button>
        </div>
      )}

      <TaskListEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        tasks={tasks}
        onAdd={addTask}
        onUpdate={updateTask}
        onRemove={removeTask}
        onReset={resetTasks}
      />
    </section>
  );
}
