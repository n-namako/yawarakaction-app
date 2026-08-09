"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// アクション編集・動画編集など、複数の場所で使い回す汎用モーダルの外枠
// カード側のbackdrop-blurなどの影響を受けないよう、document.body直下にポータルで描画する
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg animate-[praise-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-3xl bg-white px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <h2 className="text-lg font-extrabold text-stone-700">{title}</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-stone-300 transition-colors hover:text-stone-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6 pt-2 sm:px-8 sm:pb-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
