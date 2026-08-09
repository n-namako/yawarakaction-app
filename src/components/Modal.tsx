"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

// アクション編集・動画編集など、複数の場所で使い回す汎用モーダルの外枠
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg animate-[praise-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)] flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-stone-700">{title}</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="text-stone-300 transition-colors hover:text-stone-500"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
