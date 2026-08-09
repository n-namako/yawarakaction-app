"use client";

import { useCallback, useSyncExternalStore } from "react";
import { WishItem } from "@/types";
import { generateId } from "@/lib/id";

const STORAGE_KEY = "yawarakaction-wishlist";
const EMPTY_LIST: WishItem[] = [];

function readList(): WishItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishItem[]) : EMPTY_LIST;
  } catch (error) {
    console.error("やりたいことリストの読み込みに失敗しました", error);
    return EMPTY_LIST;
  }
}

function writeList(items: WishItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("やりたいことリストの保存に失敗しました", error);
  }
}

const listeners = new Set<() => void>();
let cache: WishItem[] = EMPTY_LIST;
let hasHydrated = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): WishItem[] {
  if (!hasHydrated) {
    cache = readList();
    hasHydrated = true;
  }
  return cache;
}

function getServerSnapshot(): WishItem[] {
  return EMPTY_LIST;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function set(items: WishItem[]) {
  cache = items;
  hasHydrated = true;
  writeList(items);
  emitChange();
}

// 「もっとできちゃう」機能：いつかやりたいことリストの読み込み・追加・削除を扱うフック
export function useWishList() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    set([...cache, { id: generateId("wish"), title: trimmed, createdAt: new Date().toISOString() }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    set(cache.filter((item) => item.id !== id));
  }, []);

  return { items, addItem, removeItem };
}
