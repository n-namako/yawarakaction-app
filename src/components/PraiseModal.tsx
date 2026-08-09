"use client";

import { useEffect } from "react";
import Confetti from "react-confetti";
import { Heart, X } from "lucide-react";
import { useWindowSize } from "@/hooks/useWindowSize";

interface PraiseModalProps {
  isOpen: boolean;
  message: string;
  taskName: string;
  /** キリのいい達成回数（5, 10, 20...）の時だけ数値を渡す。通常時はnull/undefined */
  milestoneCount?: number | null;
  onClose: () => void;
}

export default function PraiseModal({
  isOpen,
  message,
  taskName,
  milestoneCount,
  onClose,
}: PraiseModalProps) {
  const { width, height } = useWindowSize();
  const isMilestone = !!milestoneCount;

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, isMilestone ? 5500 : 4000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose, isMilestone]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {width > 0 && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={isMilestone ? 700 : 350}
          recycle={false}
          gravity={0.25}
          colors={
            isMilestone
              ? ["#f472b6", "#fb923c", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"]
              : ["#fda4af", "#fdba74", "#fde68a", "#a5f3fc", "#bbf7d0", "#ddd6fe"]
          }
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative mx-6 flex max-w-sm animate-[praise-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)] flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center shadow-2xl ${
          isMilestone
            ? "bg-gradient-to-br from-amber-50 via-white to-pink-50 ring-2 ring-amber-200"
            : "bg-white"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-4 top-4 text-stone-300 transition-colors hover:text-stone-500"
        >
          <X size={20} />
        </button>

        {isMilestone ? (
          <>
            <span className="text-5xl">🥳</span>
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-amber-500">
              <Heart size={14} className="fill-amber-400 text-amber-400" />
              {milestoneCount}回達成
              <Heart size={14} className="fill-amber-400 text-amber-400" />
            </p>
            <p className="bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              🎉 {message} 🎉
            </p>
            <p className="text-stone-500">
              「{taskName}」お疲れさま、できたね！
            </p>
            <p className="text-xs font-bold text-amber-400">
              💖 キリのいい{milestoneCount}回目、おめでとう！ 💖
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl">🎉</span>
            <p className="text-3xl font-extrabold text-rose-400 sm:text-4xl">{message}</p>
            <p className="text-stone-500">
              「{taskName}」お疲れさま、できたね！
            </p>
          </>
        )}
      </div>
    </div>
  );
}
