"use client";

import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useWishList } from "@/hooks/useWishList";

interface WishListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (title: string) => void;
}

export default function WishListModal({ isOpen, onClose, onComplete }: WishListModalProps) {
  const { items, addItem, removeItem } = useWishList();
  const [draft, setDraft] = useState("");

  function handleAdd() {
    if (!draft.trim()) return;
    addItem(draft);
    setDraft("");
  }

  function handleComplete(id: string, title: string) {
    removeItem(id);
    onClose(); // 褒め演出をこのモーダルの後ろに隠さないよう、先に閉じる
    onComplete(title);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="もっとできちゃう？">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-stone-400">
          急がなくていい、自分のためにいつかやりたいことのメモです。気になる映画やドラマ、読みたい本など、思いついたら書いておきましょう。
        </p>

        <div className="flex flex-col gap-2">
          {items.length === 0 ? (
            <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-400">
              まだ何もありません。下から追加してみましょう ✨
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3"
              >
                <span className="min-w-0 flex-1 break-words font-bold text-stone-700">
                  {item.title}
                </span>
                <button
                  onClick={() => handleComplete(item.id, item.title)}
                  className="shrink-0 whitespace-nowrap rounded-full bg-gradient-to-br from-violet-300 to-fuchsia-300 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  できた！
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`${item.title}を削除`}
                  className="shrink-0 text-stone-300 transition-colors hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-stone-200 p-3">
          <p className="text-xs font-bold text-stone-400">新しいやりたいことを追加</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="例：映画を観る"
              className="min-w-0 rounded-xl border border-stone-200 px-3 py-2 text-sm sm:flex-1"
              aria-label="やりたいこと"
            />
            <button
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-violet-300 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
            >
              <Plus size={16} />
              追加
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <p className="flex items-center justify-center gap-1 text-xs text-stone-300">
            <Sparkles size={12} />
            できたら「できた！」でお祝いしましょう
          </p>
        )}
      </div>
    </Modal>
  );
}
