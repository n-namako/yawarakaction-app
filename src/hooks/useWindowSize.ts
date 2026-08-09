"use client";

import { useSyncExternalStore } from "react";

interface WindowSize {
  width: number;
  height: number;
}

const SERVER_SNAPSHOT: WindowSize = { width: 0, height: 0 };
let cachedSize: WindowSize = SERVER_SNAPSHOT;

function subscribe(listener: () => void) {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
}

// getSnapshotは値が変わらない限り同じ参照を返す必要がある（useSyncExternalStoreの要件）
function getSnapshot(): WindowSize {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (cachedSize.width !== width || cachedSize.height !== height) {
    cachedSize = { width, height };
  }
  return cachedSize;
}

function getServerSnapshot(): WindowSize {
  return SERVER_SNAPSHOT;
}

// 紙吹雪(react-confetti)のサイズ計算に使うウィンドウサイズ取得フック
export function useWindowSize() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
