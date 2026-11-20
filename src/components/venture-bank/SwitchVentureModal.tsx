import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import type { VentureWorkspace } from '../../types/venture';

interface SwitchVentureModalProps {
  isOpen: boolean;
  ventures: VentureWorkspace[];
  selectedVentureId: string | null;
  onSelect: (ventureId: string) => void;
  onClose: () => void;
}

export function SwitchVentureModal({
  isOpen,
  ventures,
  selectedVentureId,
  onSelect,
  onClose,
}: SwitchVentureModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-venture-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3
              id="switch-venture-modal-title"
              className="font-display text-base font-semibold text-slate-900"
            >
              Switch Active Venture
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Each venture keeps its own saved profile and Stage 1 research in
              this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close venture switcher"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {ventures.map((venture) => {
            const isCurrent = venture.id === selectedVentureId;
            return (
              <button
                key={venture.id}
                type="button"
                onClick={() => onSelect(venture.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                  isCurrent
                    ? 'border-emerald-700 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {venture.ventureProfile.ventureName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {venture.ventureProfile.geography} ·{' '}
                    {venture.stage1.alternatives.length} alternatives
                  </p>
                </div>

                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-xs font-semibold text-emerald-700">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Selected
                  </span>
                ) : (
                  <span className="whitespace-nowrap shrink-0 text-xs font-medium text-slate-600">
                    Select
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
