"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EXERCISE_VIDEOS } from "@/data/videos";
import { ExerciseVideo } from "@/types";

const STORAGE_KEY = "jikoteikan-videos";

function readVideos(): ExerciseVideo[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EXERCISE_VIDEOS;
    const parsed = JSON.parse(raw) as ExerciseVideo[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : EXERCISE_VIDEOS;
  } catch (error) {
    console.error("動画リストの読み込みに失敗しました", error);
    return EXERCISE_VIDEOS;
  }
}

function writeVideos(videos: ExerciseVideo[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch (error) {
    console.error("動画リストの保存に失敗しました", error);
  }
}

const listeners = new Set<() => void>();
let cache: ExerciseVideo[] = EXERCISE_VIDEOS;
let hasHydrated = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ExerciseVideo[] {
  if (!hasHydrated) {
    cache = readVideos();
    hasHydrated = true;
  }
  return cache;
}

function getServerSnapshot(): ExerciseVideo[] {
  return EXERCISE_VIDEOS;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function set(videos: ExerciseVideo[]) {
  cache = videos;
  hasHydrated = true;
  writeVideos(videos);
  emitChange();
}

// 動画エクササイズ機能：動画リストの読み込み・追加・編集・削除・初期化を扱うフック
export function useEditableVideos() {
  const videos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addVideo = useCallback((video: ExerciseVideo) => {
    set([...cache, video]);
  }, []);

  const updateVideo = useCallback((id: string, updates: Partial<ExerciseVideo>) => {
    set(cache.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  }, []);

  const removeVideo = useCallback((id: string) => {
    set(cache.filter((v) => v.id !== id));
  }, []);

  const resetVideos = useCallback(() => {
    set(EXERCISE_VIDEOS);
  }, []);

  return { videos, addVideo, updateVideo, removeVideo, resetVideos };
}
