"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// 「デフォルトに戻す」など、取り消せない操作の前に挟む確認モーダル
// (window.confirm()だと見た目がアプリのトーンから外れるため、専用デザインにしている)
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "はい、戻す",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm animate-[praise-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)] flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
      >
        <span className="text-4xl">🤔</span>
        <h3 className="text-lg font-extrabold text-stone-700">{title}</h3>
        <p className="text-sm text-stone-500">{message}</p>
        <div className="mt-3 flex w-full gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-gradient-to-br from-rose-300 to-orange-300 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
