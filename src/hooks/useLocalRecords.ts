"use client";

import { useCallback, useSyncExternalStore } from "react";
import { RecordEntry } from "@/types";

const STORAGE_KEY = "yawarakaction-records";

function readRecords(): RecordEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecordEntry[]) : [];
  } catch (error) {
    console.error("記録の読み込みに失敗しました", error);
    return [];
  }
}

function writeRecords(records: RecordEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("記録の保存に失敗しました", error);
  }
}

const EMPTY_RECORDS: RecordEntry[] = [];

const listeners = new Set<() => void>();
let cache: RecordEntry[] = EMPTY_RECORDS;
let hasHydrated = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// localStorageというブラウザ外部ストアをReactの状態として安全に読み込む
// (useSyncExternalStoreはサーバー/クライアントの初期表示の食い違いも自動でケアしてくれる)
function getSnapshot(): RecordEntry[] {
  if (!hasHydrated) {
    cache = readRecords();
    hasHydrated = true;
  }
  return cache;
}

function getServerSnapshot(): RecordEntry[] {
  return EMPTY_RECORDS;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

// 記録機能：完了したアクション名と達成日時をlocalStorageに保存・読み込みするフック
export function useLocalRecords() {
  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addRecord = useCallback((taskName: string) => {
    const next: RecordEntry[] = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        taskName,
        completedAt: new Date().toISOString(),
      },
      ...readRecords(),
    ];
    cache = next;
    hasHydrated = true;
    writeRecords(next);
    emitChange();
  }, []);

  const clearRecords = useCallback(() => {
    cache = EMPTY_RECORDS;
    hasHydrated = true;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("記録の削除に失敗しました", error);
    }
    emitChange();
  }, []);

  return { records, addRecord, clearRecords };
}
