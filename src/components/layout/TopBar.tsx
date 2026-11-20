import { Check, RotateCcw } from 'lucide-react';
import type { WorkspaceView } from '../../types/venture';

interface TopBarProps {
  activeView: WorkspaceView;
  hasSelectedVenture: boolean;
  lastSavedAt: string;
  saveFeedback: string | null;
  onChangeView: (view: WorkspaceView) => void;
  onRequestReset: () => void;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Saved';
  }
}

export function TopBar({
  activeView,
  hasSelectedVenture,
  lastSavedAt,
  saveFeedback,
  onChangeView,
  onRequestReset,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0B162C] text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('venture-bank')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-600 font-display text-sm font-bold text-white">
            M
          </span>
          <span className="font-display text-base font-bold tracking-tight text-white">
            MessMind Venture Studio
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Primary studio navigation"
          className="flex items-center gap-6"
        >
          <button
            type="button"
            onClick={() => onChangeView('venture-bank')}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 ${
              activeView === 'venture-bank'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Venture Bank
          </button>

          <button
            type="button"
            disabled={!hasSelectedVenture}
            onClick={() => onChangeView('competition-lab')}
            className={`whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-45 ${
              activeView === 'competition-lab'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Competition Lab
          </button>
        </nav>

        {/* Zone 3: Save State & Reset Action */}
        <div className="flex shrink-0 items-center gap-4">
          <div
            aria-live="polite"
            className="hidden items-center gap-1.5 text-xs md:flex"
          >
            {saveFeedback ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{saveFeedback}</span>
              </span>
            ) : (
              <span className="text-slate-400 tabular-nums">
                Saved locally · {formatTime(lastSavedAt)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestReset}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-700 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Reset Workspace</span>
          </button>
        </div>
      </div>
    </header>
  );
}
