import { CheckCircle2, Lock } from 'lucide-react';
import { VENTURE_STAGES } from '../../config/stages';
import type { WorkspaceView } from '../../types/venture';

interface JourneyStagesBarProps {
  stage1Completed: boolean;
  activeView: WorkspaceView;
  hasSelectedVenture: boolean;
  onOpenStage1: () => void;
}

export function JourneyStagesBar({
  stage1Completed,
  activeView,
  hasSelectedVenture,
  onOpenStage1,
}: JourneyStagesBarProps) {
  return (
    <section
      aria-label="Venture development journey stages"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {VENTURE_STAGES.map((stage) => {
            const isStage1 = stage.status === 'active';

            if (!isStage1) {
              return (
                <div
                  key={stage.id}
                  aria-disabled="true"
                  className="flex flex-col justify-between rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-slate-500"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-[11px] font-medium tabular-nums text-slate-400">
                      Stage 0{stage.order}
                    </span>
                    <Lock
                      className="h-3 w-3 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 truncate text-xs font-medium text-slate-600">
                    {stage.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Coming Next
                  </p>
                </div>
              );
            }

            const statusLabel = stage1Completed ? 'Completed' : 'Active';
            const isFocusedInLab = activeView === 'competition-lab';

            return (
              <button
                key={stage.id}
                type="button"
                disabled={!hasSelectedVenture}
                onClick={onOpenStage1}
                className={`flex flex-col justify-between rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                  stage1Completed
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-50'
                    : isFocusedInLab
                      ? 'border-[#0B162C] bg-[#0B162C] text-white'
                      : 'border-emerald-600 bg-white text-slate-900 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`font-mono text-[11px] font-semibold tabular-nums ${
                      isFocusedInLab && !stage1Completed
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                    }`}
                  >
                    Stage 0{stage.order}
                  </span>
                  {stage1Completed ? (
                    <CheckCircle2
                      className="h-3.5 w-3.5 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs font-semibold">
                  {stage.title}
                </p>
                <p
                  className={`mt-0.5 text-[11px] font-medium ${
                    stage1Completed
                      ? 'text-emerald-700'
                      : isFocusedInLab
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                  }`}
                >
                  {statusLabel}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
