import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                variant === 'danger'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`whitespace-nowrap shrink-0 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'
                : 'bg-emerald-700 hover:bg-emerald-800 focus-visible:outline-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
