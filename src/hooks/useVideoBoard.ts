"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getRandomVideoByBodyPart, getRandomVideoByDuration } from "@/data/videos";
import { BodyPartKey, DurationKey, ExerciseVideo } from "@/types";

interface VideoBoardState {
  duration: DurationKey | null;
  bodyPart: BodyPartKey | null;
  videoId: string | null;
}

const INITIAL_STATE: VideoBoardState = { duration: null, bodyPart: null, videoId: null };

let state: VideoBoardState = INITIAL_STATE;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): VideoBoardState {
  return state;
}

function getServerSnapshot(): VideoBoardState {
  return INITIAL_STATE;
}

function setState(next: VideoBoardState) {
  state = next;
  emitChange();
}

// 動画エクササイズ機能：現在表示中の動画（時間/部位で選んだ結果）をモジュール単位で共有するフック。
// きろく画面の「もう一度やる」からも同じ状態を操作できるように、あえてVideoPlayer内のuseStateにせずここに置いている
export function useVideoBoard(videos: ExerciseVideo[]) {
  const { duration, bodyPart, videoId } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const video = videos.find((v) => v.id === videoId) ?? null;

  const selectDuration = useCallback(
    (key: DurationKey) => {
      const picked = getRandomVideoByDuration(videos, key);
      setState({ duration: key, bodyPart: null, videoId: picked?.id ?? null });
    },
    [videos]
  );

  const selectBodyPart = useCallback(
    (key: BodyPartKey) => {
      const picked = getRandomVideoByBodyPart(videos, key);
      setState({ duration: null, bodyPart: key, videoId: picked?.id ?? null });
    },
    [videos]
  );

  const shuffle = useCallback(() => {
    if (state.duration) {
      const picked = getRandomVideoByDuration(videos, state.duration, state.videoId ?? undefined);
      setState({ ...state, videoId: picked?.id ?? null });
    } else if (state.bodyPart) {
      const picked = getRandomVideoByBodyPart(videos, state.bodyPart, state.videoId ?? undefined);
      setState({ ...state, videoId: picked?.id ?? null });
    }
  }, [videos]);

  const back = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // きろく画面の「もう一度やる」から、特定の動画を表示中にする。存在しなければfalseを返す
  const selectVideoById = useCallback(
    (id: string): boolean => {
      const target = videos.find((v) => v.id === id);
      if (!target) return false;
      setState({ duration: null, bodyPart: target.bodyPart, videoId: target.id });
      return true;
    },
    [videos]
  );

  return { duration, bodyPart, video, selectDuration, selectBodyPart, shuffle, back, selectVideoById };
}
