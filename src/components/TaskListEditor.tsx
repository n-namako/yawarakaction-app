"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save, SquarePen, Trash2, X } from "lucide-react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ActionTask } from "@/types";
import { generateId } from "@/lib/id";

interface TaskListEditorProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ActionTask[];
  onAdd: (task: ActionTask) => void;
  onUpdate: (id: string, updates: Partial<ActionTask>) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

interface DraftTask {
  emoji: string;
  title: string;
  duration: string;
}

const EMPTY_DRAFT: DraftTask = { emoji: "⭐", title: "", duration: "" };

export default function TaskListEditor({
  isOpen,
  onClose,
  tasks,
  onAdd,
  onUpdate,
  onRemove,
  onReset,
}: TaskListEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftTask>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<DraftTask>(EMPTY_DRAFT);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  function startEdit(task: ActionTask) {
    setEditingId(task.id);
    setEditDraft({ emoji: task.emoji, title: task.title, duration: task.duration });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(EMPTY_DRAFT);
  }

  function saveEdit(id: string) {
    if (!editDraft.title.trim() || !editDraft.duration.trim()) return;
    onUpdate(id, {
      emoji: editDraft.emoji.trim() || "⭐",
      title: editDraft.title.trim(),
      duration: editDraft.duration.trim(),
    });
    cancelEdit();
  }

  function handleAdd() {
    if (!newDraft.title.trim() || !newDraft.duration.trim()) return;
    onAdd({
      id: generateId("task"),
      emoji: newDraft.emoji.trim() || "⭐",
      title: newDraft.title.trim(),
      duration: newDraft.duration.trim(),
    });
    setNewDraft(EMPTY_DRAFT);
  }

  function handleReset() {
    setIsResetConfirmOpen(true);
  }

  function confirmReset() {
    onReset();
    cancelEdit();
    setIsResetConfirmOpen(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="アクションを編集">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-stone-400">
            仕事や家事の合間に気軽にできる、あなたがやりたいアクションを登録してね。
          </p>

          {tasks.length === 0 && (
            <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-400">
              アクションがありません。下から追加してください。
            </p>
          )}

          {tasks.map((task) =>
            editingId === task.id ? (
              <div key={task.id} className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-3">
                <div className="flex gap-2">
                  <input
                    value={editDraft.emoji}
                    onChange={(e) => setEditDraft((d) => ({ ...d, emoji: e.target.value }))}
                    className="w-14 rounded-xl border border-stone-200 px-2 py-2 text-center text-lg"
                    maxLength={4}
                    aria-label="アイコン"
                  />
                  <input
                    value={editDraft.title}
                    onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm"
                    placeholder="アクション名"
                    aria-label="アクション名"
                  />
                  <input
                    value={editDraft.duration}
                    onChange={(e) => setEditDraft((d) => ({ ...d, duration: e.target.value }))}
                    className="w-20 rounded-xl border border-stone-200 px-2 py-2 text-sm"
                    placeholder="3分"
                    aria-label="所要時間"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-stone-400 hover:bg-stone-100"
                  >
                    <X size={14} />
                    キャンセル
                  </button>
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="flex items-center gap-1 rounded-full bg-rose-300 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-400"
                  >
                    <Save size={14} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                <span className="text-2xl">{task.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-stone-700">{task.title}</p>
                  <p className="text-xs text-stone-400">{task.duration}</p>
                </div>
                <button
                  onClick={() => startEdit(task)}
                  aria-label={`${task.title}を編集`}
                  className="text-stone-300 transition-colors hover:text-sky-500"
                >
                  <SquarePen size={18} />
                </button>
                <button
                  onClick={() => onRemove(task.id)}
                  aria-label={`${task.title}を削除`}
                  className="text-stone-300 transition-colors hover:text-rose-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          )}

          <div className="mt-2 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-stone-200 p-3">
            <p className="text-xs font-bold text-stone-400">新しいアクションを追加</p>
            <div className="flex gap-2">
              <input
                value={newDraft.emoji}
                onChange={(e) => setNewDraft((d) => ({ ...d, emoji: e.target.value }))}
                className="w-14 rounded-xl border border-stone-200 px-2 py-2 text-center text-lg"
                placeholder="⭐"
                maxLength={4}
                aria-label="アイコン"
              />
              <input
                value={newDraft.title}
                onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm"
                placeholder="アクション名（例：水を飲む）"
                aria-label="アクション名"
              />
              <input
                value={newDraft.duration}
                onChange={(e) => setNewDraft((d) => ({ ...d, duration: e.target.value }))}
                className="w-20 rounded-xl border border-stone-200 px-2 py-2 text-sm"
                placeholder="1分"
                aria-label="所要時間"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newDraft.title.trim() || !newDraft.duration.trim()}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-300 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
              <Plus size={16} />
              追加する
            </button>
          </div>

          <button
            onClick={handleReset}
            className="mt-1 flex items-center justify-center gap-1.5 self-center text-xs font-bold text-stone-400 hover:text-stone-600"
          >
            <RotateCcw size={14} />
            デフォルトに戻す
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="デフォルトに戻しますか？"
        message="アクションの一覧を初期状態に戻します。追加・編集した内容は元に戻せません。"
        onConfirm={confirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
}
