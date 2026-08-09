"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { hasAnyCloudData, readAllLocalData, writeAllLocalData } from "@/lib/cloudSync";

// 画面には何も表示しない、裏でクラウド同期だけを担当するコンポーネント。
// ログイン時に一度だけ「クラウド⇄ローカル」の初期同期をおこない、
// 以降はローカルの変更を検知してクラウドへ反映し続ける。
export default function CloudSyncManager() {
  const { status } = useSession();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/sync");
        if (!res.ok) return;
        const { data } = await res.json();

        if (hasAnyCloudData(data)) {
          // クラウドに既存データがある → それを正として端末側を上書き
          writeAllLocalData(data);
          window.location.reload();
        } else {
          // クラウドが空 → 今このブラウザにあるデータを初回アップロード
          await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readAllLocalData()),
          });
        }
      } catch (error) {
        console.error("クラウド同期の初期化に失敗しました", error);
      }
    })();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let lastSnapshot = JSON.stringify(readAllLocalData());
    const intervalId = setInterval(() => {
      const current = JSON.stringify(readAllLocalData());
      if (current === lastSnapshot) return;
      lastSnapshot = current;
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: current,
      }).catch((error) => console.error("クラウド保存に失敗しました", error));
    }, 3000);

    return () => clearInterval(intervalId);
  }, [status]);

  return null;
}
