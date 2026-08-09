"use client";

import { useState } from "react";
import { CalendarHeart, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { RecordEntry } from "@/types";

interface RecordTimelineProps {
  records: RecordEntry[];
  onClear: () => void;
  onRepeat: (entry: RecordEntry) => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "きょう";
  if (isSameDay(date, yesterday)) return "きのう";
  return date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecordTimeline({ records, onClear, onRepeat }: RecordTimelineProps) {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const groups = records.reduce<Record<string, RecordEntry[]>>((acc, record) => {
    const label = formatDateLabel(record.completedAt);
    acc[label] = acc[label] ? [...acc[label], record] : [record];
    return acc;
  }, {});

  function confirmClear() {
    onClear();
    setIsClearConfirmOpen(false);
  }

  return (
    <>
      <section className="rounded-3xl bg-white/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur-sm sm:p-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-500">
            <CalendarHeart size={20} />
            <h2 className="text-lg font-extrabold text-stone-700">これまでの記録</h2>
          </div>
          {records.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-400"
            >
              <Trash2 size={14} />
              記録を消す
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <p className="py-10 text-center text-stone-400">
            まだ記録がありません。
            <br />
            小さな一歩を踏み出すと、ここに積み重なっていきます 🌱
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(groups).map(([label, entries]) => (
              <div key={label}>
                <p className="mb-3 text-sm font-bold text-emerald-500">{label}</p>
                <ol className="relative flex flex-col gap-4 border-l-2 border-emerald-100 pl-5">
                  {entries.map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full bg-emerald-300 ring-4 ring-emerald-50" />
                      {entry.source ? (
                        <button
                          onClick={() => onRepeat(entry)}
                          className="text-left font-bold text-stone-700 transition-colors hover:text-emerald-600"
                        >
                          {entry.taskName}
                        </button>
                      ) : (
                        <p className="font-bold text-stone-700">{entry.taskName}</p>
                      )}
                      <p className="text-xs text-stone-400">{formatTime(entry.completedAt)}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="記録を消しますか？"
        message="これまでの記録をすべて消します。この操作は取り消せません。"
        confirmLabel="はい、消す"
        onConfirm={confirmClear}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
}
