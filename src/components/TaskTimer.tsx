"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatSeconds } from "@/lib/duration";
import { playChime, primeAudio } from "@/lib/chime";

interface TaskTimerProps {
  totalSeconds: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TaskTimer({ totalSeconds }: TaskTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const isFinished = remaining <= 0;

  useEffect(() => {
    if (!isRunning || isFinished) return;
    const intervalId = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, isFinished]);

  // タイマーが0になった瞬間に一度だけチャイムを鳴らす
  useEffect(() => {
    if (isFinished) {
      playChime();
    }
  }, [isFinished]);

  function handleToggle() {
    if (!isRunning) {
      primeAudio(); // ユーザー操作のタイミングで音声再生を許可しておく
    }
    setIsRunning((r) => !r);
  }

  function handleReset() {
    setIsRunning(false);
    setRemaining(totalSeconds);
  }

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#f5f5f4" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="url(#task-timer-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="task-timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-extrabold tabular-nums text-stone-700">
            {formatSeconds(remaining)}
          </span>
        </div>
      </div>

      {isFinished ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-rose-400">⏰ タイマー終了！</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500 transition-colors hover:bg-stone-200"
          >
            <RotateCcw size={14} />
            もう一度
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-rose-300 to-orange-300 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? "一時停止" : remaining === totalSeconds ? "スタート" : "再開"}
          </button>
          <button
            onClick={handleReset}
            aria-label="タイマーをリセット"
            className="rounded-full bg-stone-100 p-2 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
