import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, RotateCcw } from 'lucide-react';
import { isAlternativePopulated } from '../../hooks/useVentureStudio';
import type {
  AlternativeRecord,
  DifferentiationProfile,
  VentureProfile,
} from '../../types/venture';

interface FinalSummarySectionProps {
  ventureProfile: VentureProfile;
  alternatives: AlternativeRecord[];
  differentiation: DifferentiationProfile;
  criticalAssumption: string;
  stage1Completed: boolean;
  stage1CompletedAt: string | null;
  onSaveAssumption: (assumption: string) => void;
  onToggleComplete: (complete: boolean) => void;
}

export function FinalSummarySection({
  ventureProfile,
  alternatives,
  differentiation,
  criticalAssumption,
  stage1Completed,
  stage1CompletedAt,
  onSaveAssumption,
  onToggleComplete,
}: FinalSummarySectionProps) {
  const [assumptionDraft, setAssumptionDraft] = useState(criticalAssumption);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setAssumptionDraft(criticalAssumption);
  }, [criticalAssumption]);

  const populatedAlternatives = useMemo(
    () => alternatives.filter(isAlternativePopulated),
    [alternatives]
  );

  const biggestThreatSummary = useMemo(() => {
    const scored = populatedAlternatives.filter(
      (a): a is AlternativeRecord & { threatScore: 1 | 2 | 3 | 4 | 5 } =>
        a.threatScore !== null && a.name.trim() !== ''
    );
    if (scored.length === 0) {
      return 'No manual threat scores entered yet.';
    }
    const maxScore = Math.max(...scored.map((a) => a.threatScore));
    const topThreats = scored.filter((a) => a.threatScore === maxScore);
    const names = topThreats.map((a) => a.name).join(' & ');
    return `${names} (Manual Threat Score: ${maxScore}/5)`;
  }, [populatedAlternatives]);

  const assumptionDirty = assumptionDraft !== criticalAssumption;

  const handleSaveAssumption = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAssumption(assumptionDraft);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2600);
  };

  return (
    <section
      id="final-summary"
      aria-labelledby="final-summary-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2
            id="final-summary-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            06. Final Stage Summary
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Consolidated Stage 1 synthesis connecting target customers,
            researched alternatives, differentiation, and key validation risk.
          </p>
        </div>

        {stage1Completed && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>
              Stage 1 Completed
              {stage1CompletedAt
                ? ` · ${new Date(stage1CompletedAt).toLocaleDateString()}`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Synthesized Summary Grid */}
      <dl className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0">
        <div className="px-6 py-4 md:border-r md:border-slate-200">
          <dt className="text-xs font-semibold text-slate-500">
            Selected Target Customer
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {ventureProfile.targetCustomer}
          </dd>
        </div>

        <div className="px-6 py-4">
          <dt className="text-xs font-semibold text-slate-500">
            Main Customer Problem
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {ventureProfile.problem}
          </dd>
        </div>

        <div className="px-6 py-4 md:border-t md:border-r md:border-slate-200">
          <dt className="text-xs font-semibold text-slate-500">
            Researched Alternatives ({populatedAlternatives.length})
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {populatedAlternatives.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-slate-800">
                {populatedAlternatives.map((alt, idx) => (
                  <li key={alt.id}>
                    <span>{alt.name.trim() || `Alternative ${idx + 1}`}</span>{' '}
                    <span className="text-xs text-slate-500">
                      ({alt.type || 'Type not selected'} ·{' '}
                      {alt.evidenceQuality
                        ? `Evidence: ${alt.evidenceQuality}`
                        : 'Evidence quality not selected'}
                      )
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-500">
                No researched alternatives entered yet. Complete the blank
                slots in Section 02.
              </span>
            )}
          </dd>
        </div>

        <div className="px-6 py-4 md:border-t md:border-slate-200">
          <dt className="text-xs font-semibold text-slate-500">
            Highest Manual Threat Assessment
          </dt>
          <dd className="mt-1.5 text-sm font-medium leading-relaxed text-slate-900">
            {biggestThreatSummary}
          </dd>
          <p className="mt-1 text-xs text-slate-500">
            Derived only from optional Threat Scores manually entered in
            Section 02.
          </p>
        </div>

        <div className="px-6 py-4 md:border-t md:border-r md:border-slate-200">
          <dt className="text-xs font-semibold text-slate-500">
            MessMind&apos;s Proposed Differentiation
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {differentiation.primaryDifferentiator}
          </dd>
        </div>

        <div className="px-6 py-4 md:border-t md:border-slate-200">
          <dt className="text-xs font-semibold text-slate-500">
            Unique Value Proposition
          </dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {differentiation.uniqueValueProposition}
          </dd>
        </div>
      </dl>

      {/* Most Important Assumption Requiring Validation */}
      <form
        onSubmit={handleSaveAssumption}
        className="border-t border-slate-200 bg-slate-50/60 px-6 py-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="critical-assumption-input"
            className="text-xs font-semibold text-slate-800"
          >
            Most Important Assumption Requiring Validation
          </label>
          {savedNotice && !assumptionDirty && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
        </div>

        <textarea
          id="critical-assumption-input"
          rows={3}
          required
          value={assumptionDraft}
          onChange={(e) => setAssumptionDraft(e.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Capture the top unproven hypothesis to test in upcoming Dehradun
            campus interviews.
          </p>
          {assumptionDirty && (
            <button
              type="submit"
              className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              Save Assumption
            </button>
          )}
        </div>
      </form>

      {/* Complete Stage 1 Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-6 py-5">
        <div className="text-xs text-slate-600">
          {stage1Completed ? (
            <span>
              Stage 1 is marked complete. Stages 2–6 (Revenue &amp; Pricing,
              Market Size &amp; Demand, Go-to-Market, Financials, Operations) are
              queued next.
            </span>
          ) : (
            <span>
              Review your entered research and summary above before marking
              Stage 1 complete.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {stage1Completed ? (
            <button
              type="button"
              onClick={() => onToggleComplete(false)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reopen Stage 1</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (assumptionDirty) {
                  onSaveAssumption(assumptionDraft);
                }
                onToggleComplete(true);
              }}
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Complete Stage 1</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
