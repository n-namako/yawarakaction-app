"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Bell, BellOff, LogIn, LogOut, Send, ShieldCheck } from "lucide-react";
import Modal from "@/components/Modal";
import { DEFAULT_NOTIFY_TIMES, NOTIFY_TIME_SLOTS, NotifyTimeSlot } from "@/lib/notifyTimes";
import {
  getExistingPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/pushClient";

interface LineSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
  justLinked?: boolean;
}

type TestState = "idle" | "sending" | "sent" | "error";
type PushState = "checking" | "unsubscribed" | "subscribed" | "unsupported";

export default function LineSyncPanel({ isOpen, onClose, justLinked = false }: LineSyncPanelProps) {
  const { data: session, status } = useSession();
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [notifyTimes, setNotifyTimes] = useState<NotifyTimeSlot[]>(DEFAULT_NOTIFY_TIMES);
  const [isSavingNotify, setIsSavingNotify] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");
  const [pushState, setPushState] = useState<PushState>("checking");
  const [pushError, setPushError] = useState<string | null>(null);
  const [justUnlinked, setJustUnlinked] = useState(false);

  // モーダルを開き直したら「解除しました」表示はリセットする
  useEffect(() => {
    if (isOpen) setJustUnlinked(false);
  }, [isOpen]);

  async function handleSignOut() {
    await signOut({ redirect: false });
    setJustUnlinked(true);
  }

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

  useEffect(() => {
    (async () => {
      if (!isPushSupported()) {
        setPushState("unsupported");
        return;
      }
      try {
        const sub = await getExistingPushSubscription();
        setPushState(sub ? "subscribed" : "unsubscribed");
      } catch {
        setPushState("unsubscribed");
      }
    })();
  }, [isOpen]);

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

  async function handleEnablePush() {
    setPushError(null);
    try {
      await subscribeToPush();
      setPushState("subscribed");
      setNotifyEnabled(true);
      await saveSettings(true, notifyTimes);
    } catch (error) {
      setPushError(error instanceof Error ? error.message : "通知の許可に失敗しました");
    }
  }

  async function handleDisablePush() {
    await unsubscribeFromPush();
    setPushState("unsubscribed");
  }

  function handleToggleNotify() {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    saveSettings(next, notifyTimes);
  }

  function handleToggleTime(slot: NotifyTimeSlot) {
    const isSelected = notifyTimes.includes(slot);
    if (isSelected && notifyTimes.length === 1) return;
    const next = isSelected ? notifyTimes.filter((t) => t !== slot) : [...notifyTimes, slot].sort();
    setNotifyTimes(next);
    saveSettings(notifyEnabled, next);
  }

  async function handleSendTest() {
    setTestState("sending");
    setPushError(null);
    try {
      const res = await fetch("/api/notify-test", { method: "POST" });
      const data = await res.json().catch(() => null);
      setTestState(res.ok ? "sent" : "error");
      if (!res.ok && data?.error) {
        setPushError(data.error);
      }
    } catch {
      setTestState("error");
    } finally {
      setTimeout(() => setTestState("idle"), 3000);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="データ保存・通知">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-stone-400">
          LINEでログインすると、①記録やアクションのデータがブラウザのキャッシュを消しても消えなくなり、②この端末に「プッシュ通知」でリマインドを届けられるようになります。通知だけ使いたい場合も、まずこのログインが必要です（通知そのものはLINEではなく、ブラウザ標準のプッシュ通知でお届けします）。
        </p>

        {status === "authenticated" ? (
          <div className="flex flex-col gap-3">
            {justLinked && (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-600">
                🎉 連携しました！これでデータが消えなくなります。
              </p>
            )}

            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
              <ShieldCheck size={20} className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-emerald-500">連携中（データ保存）</p>
                <p className="font-bold text-stone-700">{session?.user?.name ?? "LINEユーザー"}</p>
              </div>
            </div>

            {pushState === "unsupported" && (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-600">
                このブラウザは通知に対応していません。iPhoneの場合は「ホーム画面に追加」してから、そのアイコンで開き直すと使えるようになります。
              </p>
            )}

            {pushState !== "unsupported" && pushState !== "checking" && (
              <>
                {pushState === "unsubscribed" ? (
                  <button
                    onClick={handleEnablePush}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                  >
                    <Bell size={18} />
                    この端末で通知を受け取る
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleNotify}
                      disabled={isSavingNotify}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                        notifyEnabled ? "bg-sky-50 text-sky-600" : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Bell size={16} />
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
                      {testState === "sent" && "送信しました！通知を確認してね ✅"}
                      {testState === "error" && "送信に失敗しました…"}
                    </button>

                    <button
                      onClick={handleDisablePush}
                      className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-4 py-3 text-xs font-bold text-stone-400 transition-colors hover:bg-stone-200"
                    >
                      <BellOff size={14} />
                      この端末の通知をやめる
                    </button>
                  </>
                )}
              </>
            )}

            {pushError && <p className="text-xs text-rose-400">{pushError}</p>}

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-200"
            >
              <LogOut size={16} />
              連携を解除する
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {justUnlinked && (
              <p className="rounded-2xl bg-stone-50 px-4 py-3 text-xs text-stone-500">
                解除しました。データはクラウドに残っているので、再度LINEでログインすればすぐに元通りになります。
              </p>
            )}
            <button
              onClick={() => signIn("line", { callbackUrl: "/?linked=1" })}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-400 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <LogIn size={18} />
              LINEでログインする
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
