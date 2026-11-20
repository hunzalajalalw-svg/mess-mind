import { RefreshCw } from 'lucide-react';
import { VENTURE_STAGES } from '../../config/stages';
import { MIN_COMPLETED_FOR_POSITIONING_MAP } from '../../data/initialVentureData';
import type { Stage1SectionId } from '../../types/venture';

interface Stage1HeaderProps {
  ventureName: string;
  geography: string;
  completedCount: number;
  totalSlotsCount: number;
  stage1Completed: boolean;
  viewMode: 'all' | Stage1SectionId;
  onChangeViewMode: (mode: 'all' | Stage1SectionId) => void;
  onBackToVentureBank: () => void;
  onRequestSwitchVenture: () => void;
}

export function Stage1Header({
  ventureName,
  geography,
  completedCount,
  totalSlotsCount,
  stage1Completed,
  viewMode,
  onChangeViewMode,
  onBackToVentureBank,
  onRequestSwitchVenture,
}: Stage1HeaderProps) {
  const stage1 = VENTURE_STAGES[0];
  const sections = stage1.sections ?? [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToVentureBank}
              className="inline-flex items-center whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              ← Back to Venture Bank
            </button>

            <span className="text-xs text-slate-500">
              Active Venture:{' '}
              <span className="font-semibold text-slate-900">{ventureName}</span>{' '}
              · {geography}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-slate-600">
              {completedCount} / {MIN_COMPLETED_FOR_POSITIONING_MAP} completed
              {` (${totalSlotsCount} slots)`}
              {stage1Completed ? ' · Stage 1 Complete' : ''}
            </span>

            <button
              type="button"
              onClick={onRequestSwitchVenture}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Switch Venture</span>
            </button>
          </div>
        </div>

        <div className="mt-4 max-w-3xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Competition Lab — {stage1.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Mission: </span>
            {stage1.mission}
          </p>
        </div>
      </div>

      {/* Interactive Section Filter / Jump Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onChangeViewMode('all')}
          className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
            viewMode === 'all'
              ? 'bg-[#0B162C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          All Sections ({sections.length})
        </button>
        {sections.map((sec) => {
          const active = viewMode === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onChangeViewMode(sec.id)}
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                active
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <span className="mr-1 font-mono text-[11px] tabular-nums opacity-75">
                {sec.number}.
              </span>
              {sec.shortLabel}
            </button>
          );
        })}
      </div>
    </section>
  );
}
