"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, MessageCircle, Send, ShieldCheck } from "lucide-react";
import Modal from "@/components/Modal";
import { DEFAULT_NOTIFY_TIMES, NOTIFY_TIME_SLOTS, NotifyTimeSlot } from "@/lib/notifyTimes";

interface LineSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TestState = "idle" | "sending" | "sent" | "error";

export default function LineSyncPanel({ isOpen, onClose }: LineSyncPanelProps) {
  const { data: session, status } = useSession();
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyTimes, setNotifyTimes] = useState<NotifyTimeSlot[]>(DEFAULT_NOTIFY_TIMES);
  const [isSavingNotify, setIsSavingNotify] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notify-settings")
      .then((res) => res.json())
      .then((data) => {
        setNotifyEnabled(Boolean(data.notifyEnabled));
        if (Array.isArray(data.notifyTimes) && data.notifyTimes.length > 0) {
          setNotifyTimes(data.notifyTimes);
        }
      })
      .catch(() => {});
  }, [status]);

  async function saveSettings(nextEnabled: boolean, nextTimes: NotifyTimeSlot[]) {
    setIsSavingNotify(true);
    try {
      await fetch("/api/notify-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyEnabled: nextEnabled, notifyTimes: nextTimes }),
      });
    } catch (error) {
      console.error("通知設定の保存に失敗しました", error);
    } finally {
      setIsSavingNotify(false);
    }
  }

  function handleToggleNotify() {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    saveSettings(next, notifyTimes);
  }

  function handleToggleTime(slot: NotifyTimeSlot) {
    const isSelected = notifyTimes.includes(slot);
    // 最低1つは選択された状態を保つ
    if (isSelected && notifyTimes.length === 1) return;
    const next = isSelected
      ? notifyTimes.filter((t) => t !== slot)
      : [...notifyTimes, slot].sort();
    setNotifyTimes(next);
    saveSettings(notifyEnabled, next);
  }

  async function handleSendTest() {
    setTestState("sending");
    try {
      const res = await fetch("/api/notify-test", { method: "POST" });
      setTestState(res.ok ? "sent" : "error");
    } catch {
      setTestState("error");
    } finally {
      setTimeout(() => setTestState("idle"), 3000);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LINEと連携">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-stone-400">
          LINEでログインすると、記録やアクションのデータがブラウザのキャッシュを消しても消えなくなります。毎日のリマインドもLINEに届くようになります。
        </p>

        {status === "authenticated" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
              <ShieldCheck size={20} className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-emerald-500">連携中</p>
                <p className="font-bold text-stone-700">{session?.user?.name ?? "LINEユーザー"}</p>
              </div>
            </div>

            <button
              onClick={handleToggleNotify}
              disabled={isSavingNotify}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                notifyEnabled ? "bg-sky-50 text-sky-600" : "bg-stone-100 text-stone-400"
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageCircle size={16} />
                毎日のリマインド通知
              </span>
              <span>{notifyEnabled ? "ON" : "OFF"}</span>
            </button>

            {notifyEnabled && (
              <div className="flex flex-col gap-2 rounded-2xl bg-stone-50 p-3">
                <p className="text-xs font-bold text-stone-400">通知する時間帯（複数選択OK）</p>
                <div className="flex flex-wrap gap-2">
                  {NOTIFY_TIME_SLOTS.map((slot) => {
                    const isSelected = notifyTimes.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => handleToggleTime(slot)}
                        disabled={isSavingNotify}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-sky-400 text-white"
                            : "bg-white text-stone-400 ring-1 ring-stone-200"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-400">
                  選んだ時間帯の数だけ、1日に届く回数が増えます（日本時間）
                </p>
              </div>
            )}

            <button
              onClick={handleSendTest}
              disabled={testState === "sending"}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-violet-100 px-4 py-3 text-sm font-bold text-violet-500 transition-colors hover:bg-violet-200"
            >
              <Send size={16} />
              {testState === "idle" && "テスト通知を送る"}
              {testState === "sending" && "送信中…"}
              {testState === "sent" && "送信しました！LINEを確認してね ✅"}
              {testState === "error" && "送信に失敗しました…"}
            </button>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-200"
            >
              <LogOut size={16} />
              連携を解除する
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("line")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-400 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <LogIn size={18} />
            LINEでログインする
          </button>
        )}
      </div>
    </Modal>
  );
}
