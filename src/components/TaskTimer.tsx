"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatSeconds } from "@/lib/duration";
import { playChime, primeAudio } from "@/lib/chime";

interface TaskTimerProps {
  totalSeconds: number;
}

const RADIUS = 52;
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
    if (isFinished) {
      // 終了後にもう一度タップしたら、そのまま最初からやり直せるようにする
      setRemaining(totalSeconds);
      setIsRunning(false);
      return;
    }
    if (!isRunning) {
      primeAudio(); // ユーザー操作のタイミングで音声再生を許可しておく
    }
    setIsRunning((r) => !r);
  }

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const label = isFinished
    ? "もう一度スタート"
    : isRunning
      ? "一時停止"
      : remaining === totalSeconds
        ? "スタート"
        : "再開";

  return (
    <button
      onClick={handleToggle}
      aria-label={label}
      className="relative flex h-28 w-28 items-center justify-center rounded-full transition-transform active:scale-95"
    >
      <svg width="112" height="112" viewBox="0 0 130 130" className="-rotate-90">
        <circle cx="65" cy="65" r={RADIUS} fill="none" stroke="#f5f5f4" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {isFinished ? (
          <span className="text-3xl">⏰</span>
        ) : (
          <>
            <span className="text-xl font-extrabold tabular-nums text-stone-700">
              {formatSeconds(remaining)}
            </span>
            {isRunning ? (
              <Pause size={16} className="text-rose-400" />
            ) : (
              <Play size={16} className="text-rose-400" />
            )}
          </>
        )}
      </div>
    </button>
  );
}
