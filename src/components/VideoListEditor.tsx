"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save, SquarePen, Trash2, X } from "lucide-react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { BODY_PART_OPTIONS, DURATION_OPTIONS } from "@/data/videos";
import { BodyPartKey, DurationKey, ExerciseVideo } from "@/types";
import { generateId } from "@/lib/id";

interface VideoListEditorProps {
  isOpen: boolean;
  onClose: () => void;
  videos: ExerciseVideo[];
  onAdd: (video: ExerciseVideo) => void;
  onUpdate: (id: string, updates: Partial<ExerciseVideo>) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
}

interface DraftVideo {
  title: string;
  duration: DurationKey;
  bodyPart: BodyPartKey;
  youtubeId: string;
}

const EMPTY_DRAFT: DraftVideo = { title: "", duration: "3", bodyPart: "fullbody", youtubeId: "" };

function durationLabel(key: DurationKey) {
  return DURATION_OPTIONS.find((o) => o.key === key)?.label ?? key;
}

function bodyPartLabel(key: BodyPartKey) {
  return BODY_PART_OPTIONS.find((o) => o.key === key)?.label ?? key;
}

export default function VideoListEditor({
  isOpen,
  onClose,
  videos,
  onAdd,
  onUpdate,
  onRemove,
  onReset,
}: VideoListEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftVideo>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<DraftVideo>(EMPTY_DRAFT);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  function startEdit(video: ExerciseVideo) {
    setEditingId(video.id);
    setEditDraft({
      title: video.title,
      duration: video.duration,
      bodyPart: video.bodyPart,
      youtubeId: video.youtubeId ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(EMPTY_DRAFT);
  }

  function saveEdit(id: string) {
    if (!editDraft.title.trim()) return;
    onUpdate(id, {
      title: editDraft.title.trim(),
      duration: editDraft.duration,
      bodyPart: editDraft.bodyPart,
      youtubeId: editDraft.youtubeId.trim() || null,
    });
    cancelEdit();
  }

  function handleAdd() {
    if (!newDraft.title.trim()) return;
    onAdd({
      id: generateId("video"),
      title: newDraft.title.trim(),
      duration: newDraft.duration,
      bodyPart: newDraft.bodyPart,
      youtubeId: newDraft.youtubeId.trim() || null,
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
      <Modal isOpen={isOpen} onClose={onClose} title="動画を編集">
        <div className="flex flex-col gap-3">
          {videos.length === 0 && (
            <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-400">
              動画がありません。下から追加してください。
            </p>
          )}

          {videos.map((video) =>
            editingId === video.id ? (
              <div key={video.id} className="flex flex-col gap-2 rounded-2xl bg-sky-50 p-3">
                <input
                  value={editDraft.title}
                  onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                  className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  placeholder="動画タイトル"
                  aria-label="動画タイトル"
                />
                <div className="flex gap-2">
                  <select
                    value={editDraft.duration}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, duration: e.target.value as DurationKey }))
                    }
                    className="rounded-xl border border-stone-200 px-2 py-2 text-sm"
                    aria-label="所要時間"
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editDraft.bodyPart}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, bodyPart: e.target.value as BodyPartKey }))
                    }
                    className="rounded-xl border border-stone-200 px-2 py-2 text-sm"
                    aria-label="対象の部位"
                  >
                    {BODY_PART_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={editDraft.youtubeId}
                  onChange={(e) => setEditDraft((d) => ({ ...d, youtubeId: e.target.value }))}
                  className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  placeholder="YouTube動画ID（任意）"
                  aria-label="YouTube動画ID"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-stone-400 hover:bg-stone-100"
                  >
                    <X size={14} />
                    キャンセル
                  </button>
                  <button
                    onClick={() => saveEdit(video.id)}
                    className="flex items-center gap-1 rounded-full bg-sky-300 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400"
                  >
                    <Save size={14} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div key={video.id} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                <div className="flex-1">
                  <p className="font-bold text-stone-700">{video.title}</p>
                  <p className="text-xs text-stone-400">
                    {durationLabel(video.duration)} ・ {bodyPartLabel(video.bodyPart)}
                    {video.youtubeId ? ` ・ ID: ${video.youtubeId}` : " ・ ダミー動画"}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(video)}
                  aria-label={`${video.title}を編集`}
                  className="text-stone-300 transition-colors hover:text-sky-500"
                >
                  <SquarePen size={18} />
                </button>
                <button
                  onClick={() => onRemove(video.id)}
                  aria-label={`${video.title}を削除`}
                  className="text-stone-300 transition-colors hover:text-rose-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )
          )}

          <div className="mt-2 flex flex-col gap-2 rounded-2xl border-2 border-dashed border-stone-200 p-3">
            <p className="text-xs font-bold text-stone-400">新しい動画を追加</p>
            <input
              value={newDraft.title}
              onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
              placeholder="動画タイトル（例：肩甲骨ストレッチ）"
              aria-label="動画タイトル"
            />
            <div className="flex gap-2">
              <select
                value={newDraft.duration}
                onChange={(e) => setNewDraft((d) => ({ ...d, duration: e.target.value as DurationKey }))}
                className="rounded-xl border border-stone-200 px-2 py-2 text-sm"
                aria-label="所要時間"
              >
                {DURATION_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={newDraft.bodyPart}
                onChange={(e) => setNewDraft((d) => ({ ...d, bodyPart: e.target.value as BodyPartKey }))}
                className="rounded-xl border border-stone-200 px-2 py-2 text-sm"
                aria-label="対象の部位"
              >
                {BODY_PART_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={newDraft.youtubeId}
              onChange={(e) => setNewDraft((d) => ({ ...d, youtubeId: e.target.value }))}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
              placeholder="YouTube動画ID（任意）"
              aria-label="YouTube動画ID"
            />
            <button
              onClick={handleAdd}
              disabled={!newDraft.title.trim()}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-sky-300 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
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
        message="動画の一覧を初期状態に戻します。追加・編集した内容は元に戻せません。"
        onConfirm={confirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
}
