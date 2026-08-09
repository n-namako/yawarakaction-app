"use client";

const KEYS = {
  tasks: "yawarakaction-tasks",
  videos: "yawarakaction-videos",
  records: "yawarakaction-records",
  wishlist: "yawarakaction-wishlist",
} as const;

export interface CloudData {
  tasks: unknown;
  videos: unknown;
  records: unknown;
  wishlist: unknown;
}

function readKey(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`${key}の読み込みに失敗しました`, error);
    return null;
  }
}

// 4つのlocalStorageキー（タスク・動画・記録・やりたいことリスト）をまとめて読む
export function readAllLocalData(): CloudData {
  return {
    tasks: readKey(KEYS.tasks),
    videos: readKey(KEYS.videos),
    records: readKey(KEYS.records),
    wishlist: readKey(KEYS.wishlist),
  };
}

// クラウドから取得したデータでlocalStorageを上書きする
export function writeAllLocalData(data: Partial<CloudData>) {
  if (data.tasks) window.localStorage.setItem(KEYS.tasks, JSON.stringify(data.tasks));
  if (data.videos) window.localStorage.setItem(KEYS.videos, JSON.stringify(data.videos));
  if (data.records) window.localStorage.setItem(KEYS.records, JSON.stringify(data.records));
  if (data.wishlist) window.localStorage.setItem(KEYS.wishlist, JSON.stringify(data.wishlist));
}

export function hasAnyCloudData(data: Partial<CloudData> | null | undefined): boolean {
  if (!data) return false;
  return Boolean(data.tasks || data.videos || data.records || data.wishlist);
}
