"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ACTION_TASKS, getRandomTask } from "@/data/tasks";
import { ActionTask } from "@/types";

const STORAGE_KEY = "yawarakaction-tasks";

interface TaskBoardState {
  tasks: ActionTask[];
  currentTaskId: string | null;
}

function readTasks(): ActionTask[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return ACTION_TASKS;
    const parsed = JSON.parse(raw) as ActionTask[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ACTION_TASKS;
  } catch (error) {
    console.error("アクションリストの読み込みに失敗しました", error);
    return ACTION_TASKS;
  }
}

function writeTasks(tasks: ActionTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("アクションリストの保存に失敗しました", error);
  }
}

// サーバーでは常にデフォルトの先頭アクションを表示し、クライアントでのみ
// 保存済みリストの読み込み＋ランダム抽選をおこなう（ハイドレーション不整合を防ぐため）
const SERVER_STATE: TaskBoardState = {
  tasks: ACTION_TASKS,
  currentTaskId: ACTION_TASKS[0]?.id ?? null,
};

let state: TaskBoardState = SERVER_STATE;
let hasHydrated = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): TaskBoardState {
  if (!hasHydrated) {
    const tasks = readTasks();
    const picked = getRandomTask(tasks);
    state = { tasks, currentTaskId: picked?.id ?? null };
    hasHydrated = true;
  }
  return state;
}

function getServerSnapshot(): TaskBoardState {
  return SERVER_STATE;
}

function applyTasks(nextTasks: ActionTask[], nextCurrentId?: string | null) {
  const currentId =
    nextCurrentId !== undefined
      ? nextCurrentId
      : nextTasks.some((t) => t.id === state.currentTaskId)
        ? state.currentTaskId
        : (nextTasks[0]?.id ?? null);
  state = { tasks: nextTasks, currentTaskId: currentId };
  hasHydrated = true;
  writeTasks(nextTasks);
  emitChange();
}

// アクション提案機能：リストの読み込み/永続化と、現在表示中アクションの抽選をまとめて扱うフック
export function useTaskBoard() {
  const { tasks, currentTaskId } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? tasks[0] ?? null;

  const shuffle = useCallback(() => {
    if (state.tasks.length === 0) return;
    const next = getRandomTask(state.tasks, state.currentTaskId ?? undefined);
    state = { ...state, currentTaskId: next?.id ?? null };
    emitChange();
  }, []);

  const addTask = useCallback((task: ActionTask) => {
    applyTasks([...state.tasks, task]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<ActionTask>) => {
    applyTasks(state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    const next = state.tasks.filter((t) => t.id !== id);
    const currentId = state.currentTaskId === id ? (next[0]?.id ?? null) : state.currentTaskId;
    applyTasks(next, currentId);
  }, []);

  const resetTasks = useCallback(() => {
    applyTasks(ACTION_TASKS, ACTION_TASKS[0]?.id ?? null);
  }, []);

  // きろく画面の「もう一度やる」から、特定のアクションを表示中にする。存在しなければfalseを返す
  const selectTask = useCallback((id: string): boolean => {
    if (!state.tasks.some((t) => t.id === id)) return false;
    state = { ...state, currentTaskId: id };
    emitChange();
    return true;
  }, []);

  return { tasks, currentTask, shuffle, addTask, updateTask, removeTask, resetTasks, selectTask };
}
