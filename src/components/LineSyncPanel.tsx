"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import Modal from "@/components/Modal";

interface LineSyncPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LineSyncPanel({ isOpen, onClose }: LineSyncPanelProps) {
  const { data: session, status } = useSession();
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [isSavingNotify, setIsSavingNotify] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notify-settings")
      .then((res) => res.json())
      .then((data) => setNotifyEnabled(Boolean(data.notifyEnabled)))
      .catch(() => {});
  }, [status]);

  async function handleToggleNotify() {
    const next = !notifyEnabled;
    setNotifyEnabled(next);
    setIsSavingNotify(true);
    try {
      await fetch("/api/notify-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyEnabled: next }),
      });
    } catch (error) {
      console.error("通知設定の保存に失敗しました", error);
    } finally {
      setIsSavingNotify(false);
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
                毎日のリマインド通知（朝9時ごろ）
              </span>
              <span>{notifyEnabled ? "ON" : "OFF"}</span>
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
