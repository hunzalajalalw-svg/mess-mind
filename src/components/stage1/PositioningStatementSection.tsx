import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  RotateCcw,
  Save,
  ShieldAlert,
} from 'lucide-react';
import { formatPositioningStatement } from '../../data/initialVentureData';
import type {
  AlternativeRecord,
  PositioningStatementData,
  StatementEvaluationLevel,
  StrategicCoordinate,
  VentureProfile,
} from '../../types/venture';
import { evaluatePositioningStatement } from '../../utils/evaluatePositioningStatement';

interface PositioningStatementSectionProps {
  ventureProfile: VentureProfile;
  alternatives: AlternativeRecord[];
  messMindPosition: StrategicCoordinate | null;
  statement: PositioningStatementData;
  onUpdateDraft: (next: PositioningStatementData) => void;
  onSaveStatement: (next: PositioningStatementData) => void;
}

function getRatingStyles(rating: StatementEvaluationLevel): {
  text: string;
  surface: string;
} {
  switch (rating) {
    case 'Strong':
      return {
        text: 'text-emerald-800',
        surface: 'border-emerald-200 bg-emerald-50/60',
      };
    case 'Needs Improvement':
      return {
        text: 'text-amber-800',
        surface: 'border-amber-200 bg-amber-50/60',
      };
    case 'Weak':
    default:
      return {
        text: 'text-rose-800',
        surface: 'border-rose-200 bg-rose-50/60',
      };
  }
}

export function PositioningStatementSection({
  ventureProfile,
  alternatives,
  messMindPosition,
  statement,
  onUpdateDraft,
  onSaveStatement,
}: PositioningStatementSectionProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const matrixAlternatives = useMemo(
    () => alternatives.filter((alt) => alt.name.trim() !== ''),
    [alternatives]
  );

  const selectedAlternative = useMemo(
    () =>
      matrixAlternatives.find((alt) => alt.id === statement.mainAlternativeId) ??
      null,
    [matrixAlternatives, statement.mainAlternativeId]
  );

  const liveEvaluations = useMemo(
    () =>
      evaluatePositioningStatement({
        statement,
        ventureProfile,
        alternatives,
        messMindPosition,
      }),
    [statement, ventureProfile, alternatives, messMindPosition]
  );

  const hasNeedsEvidence = liveEvaluations.some((e) => e.needsEvidence);
  const assumptionFlags = useMemo(() => {
    const unique = new Set<string>();
    liveEvaluations.forEach((ev) => {
      if (ev.assumptionFlag) {
        unique.add(ev.assumptionFlag);
      }
    });
    return Array.from(unique);
  }, [liveEvaluations]);

  const generatedFromFields = formatPositioningStatement({
    targetCustomer: statement.targetCustomer,
    categorySolution: statement.categorySolution,
    primaryBenefit: statement.primaryBenefit,
    mainAlternativeName: selectedAlternative?.name ?? '',
    reasonToBelieve: statement.reasonToBelieve,
  });

  const handleFieldChange = (
    patch: Partial<
      Pick<
        PositioningStatementData,
        | 'targetCustomer'
        | 'categorySolution'
        | 'primaryBenefit'
        | 'mainAlternativeId'
        | 'reasonToBelieve'
      >
    >
  ) => {
    const nextDraft: PositioningStatementData = {
      ...statement,
      ...patch,
    };
    const nextSelectedAlt =
      matrixAlternatives.find((a) => a.id === nextDraft.mainAlternativeId) ??
      null;

    const nextText = formatPositioningStatement({
      targetCustomer: nextDraft.targetCustomer,
      categorySolution: nextDraft.categorySolution,
      primaryBenefit: nextDraft.primaryBenefit,
      mainAlternativeName: nextSelectedAlt?.name ?? '',
      reasonToBelieve: nextDraft.reasonToBelieve,
    });

    const updatedWithText: PositioningStatementData = {
      ...nextDraft,
      statementText: nextText,
    };

    const nextEvals = evaluatePositioningStatement({
      statement: updatedWithText,
      ventureProfile,
      alternatives,
      messMindPosition,
    });

    setValidationErrors([]);
    onUpdateDraft({
      ...updatedWithText,
      evaluations: nextEvals,
    });
  };

  const handleManualStatementEdit = (nextText: string) => {
    const updated: PositioningStatementData = {
      ...statement,
      statementText: nextText,
    };
    const nextEvals = evaluatePositioningStatement({
      statement: updated,
      ventureProfile,
      alternatives,
      messMindPosition,
    });
    setValidationErrors([]);
    onUpdateDraft({
      ...updated,
      evaluations: nextEvals,
    });
  };

  const handleSave = () => {
    const missing: string[] = [];
    if (!statement.targetCustomer.trim()) {
      missing.push('Target Customer');
    }
    if (!statement.categorySolution.trim()) {
      missing.push('Category / Type of Solution');
    }
    if (!statement.primaryBenefit.trim()) {
      missing.push('Primary Benefit');
    }
    if (!selectedAlternative) {
      missing.push('Main Alternative (select one from Competitor Matrix)');
    }
    if (!statement.reasonToBelieve.trim()) {
      missing.push('Reason to Believe');
    }

    if (missing.length > 0) {
      setValidationErrors(missing);
      return;
    }

    setValidationErrors([]);
    onSaveStatement({
      ...statement,
      evaluations: liveEvaluations,
    });
  };

  const strongCount = liveEvaluations.filter(
    (e) => e.rating === 'Strong'
  ).length;
  const isAllFiveComplete =
    Boolean(statement.targetCustomer.trim()) &&
    Boolean(statement.categorySolution.trim()) &&
    Boolean(statement.primaryBenefit.trim()) &&
    Boolean(selectedAlternative) &&
    Boolean(statement.reasonToBelieve.trim());

  const hasCustomFullText =
    statement.statementText.trim() !== generatedFromFields.trim();

  return (
    <section
      id="positioning-statement"
      aria-labelledby="positioning-statement-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      {/* Header & Purpose */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2
              id="positioning-statement-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              05. Positioning Statement
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              A positioning statement defines how the venture should be
              understood by its target customer relative to competing
              alternatives.
            </p>
          </div>

          <div className="text-right font-mono text-xs tabular-nums text-slate-600">
            {statement.saved ? (
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Saved
                  {statement.savedAt
                    ? ` · ${new Date(statement.savedAt).toLocaleDateString()}`
                    : ''}
                </span>
              </span>
            ) : (
              <span>Draft · Not yet saved</span>
            )}
          </div>
        </div>

        {/* Template Structure Callout */}
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Structure: </span>
          For <span className="font-medium text-slate-900">[Target Customer]</span>,
          our venture is a{' '}
          <span className="font-medium text-slate-900">
            [Category / Type of Solution]
          </span>{' '}
          that provides{' '}
          <span className="font-medium text-slate-900">[Primary Benefit]</span>,
          unlike{' '}
          <span className="font-medium text-slate-900">[Main Alternative]</span>,
          because{' '}
          <span className="font-medium text-slate-900">
            [Reason to Believe]
          </span>
          .
        </div>
      </div>

      {/* STEP 1 — Build the Statement */}
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Step 1 — Build the Statement
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Target Customer is pre-filled from your Venture Profile. Use only
              capabilities and competitor evidence already entered in the app.
            </p>
          </div>

          <span className="font-mono text-xs tabular-nums text-slate-500">
            {
              [
                statement.targetCustomer.trim(),
                statement.categorySolution.trim(),
                statement.primaryBenefit.trim(),
                selectedAlternative ? 'ok' : '',
                statement.reasonToBelieve.trim(),
              ].filter(Boolean).length
            }{' '}
            / 5 fields complete
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* 1. Target Customer */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="ps-target-customer"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
              >
                1. Target Customer
              </label>
              {statement.targetCustomer !== ventureProfile.targetCustomer && (
                <button
                  type="button"
                  onClick={() =>
                    handleFieldChange({
                      targetCustomer: ventureProfile.targetCustomer,
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Reset from Venture Profile</span>
                </button>
              )}
            </div>
            <textarea
              id="ps-target-customer"
              rows={2}
              value={statement.targetCustomer}
              onChange={(e) =>
                handleFieldChange({ targetCustomer: e.target.value })
              }
              placeholder="Enter target customer from your Venture Profile..."
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* 2. Category / Type of Solution */}
          <div>
            <label
              htmlFor="ps-category"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              2. Category / Type of Solution
            </label>
            <input
              id="ps-category"
              type="text"
              value={statement.categorySolution}
              onChange={(e) =>
                handleFieldChange({ categorySolution: e.target.value })
              }
              placeholder="Describe what kind of solution MessMind is..."
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* 4. Main Alternative */}
          <div>
            <label
              htmlFor="ps-main-alternative"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              4. Main Alternative (from Competitor Matrix)
            </label>
            <select
              id="ps-main-alternative"
              value={statement.mainAlternativeId}
              onChange={(e) =>
                handleFieldChange({ mainAlternativeId: e.target.value })
              }
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="">
                {matrixAlternatives.length === 0
                  ? 'No named alternatives in Competitor Matrix yet'
                  : 'Select an alternative from your Competitor Matrix...'}
              </option>
              {matrixAlternatives.map((alt) => (
                <option key={alt.id} value={alt.id}>
                  {alt.name}
                  {alt.type ? ` (${alt.type})` : ''}
                </option>
              ))}
            </select>
            {selectedAlternative && (
              <p className="mt-1.5 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  Entered weakness:{' '}
                </span>
                {selectedAlternative.weaknesses.trim() ||
                  'No weakness entered yet in Section 02'}
              </p>
            )}
          </div>

          {/* 3. Primary Benefit */}
          <div className="lg:col-span-2">
            <label
              htmlFor="ps-primary-benefit"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              3. Primary Benefit
            </label>
            <textarea
              id="ps-primary-benefit"
              rows={2}
              value={statement.primaryBenefit}
              onChange={(e) =>
                handleFieldChange({ primaryBenefit: e.target.value })
              }
              placeholder="State the most important operational customer benefit..."
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* 5. Reason to Believe */}
          <div className="lg:col-span-2">
            <label
              htmlFor="ps-reason-to-believe"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              5. Reason to Believe
            </label>
            <textarea
              id="ps-reason-to-believe"
              rows={3}
              value={statement.reasonToBelieve}
              onChange={(e) =>
                handleFieldChange({ reasonToBelieve: e.target.value })
              }
              placeholder="Explain why customers should believe the benefit, referencing only entered Venture Profile capabilities and Competitor Research evidence..."
              className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Entered Venture Offer Reference:{' '}
              </span>
              {ventureProfile.offer.trim() || 'No offer entered in Venture Profile'}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2 — Generate the Positioning Statement */}
      <div className="border-b border-slate-200 bg-slate-50/40 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Step 2 — Generated Positioning Statement
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Updates automatically when any of the 5 fields above change. You
              can also refine the wording directly below.
            </p>
          </div>

          {hasCustomFullText && (
            <button
              type="button"
              onClick={() => handleManualStatementEdit(generatedFromFields)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Rebuild from 5 inputs</span>
            </button>
          )}
        </div>

        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <label htmlFor="ps-full-statement" className="sr-only">
            Generated Positioning Statement
          </label>
          <textarea
            id="ps-full-statement"
            rows={4}
            value={statement.statementText}
            onChange={(e) => handleManualStatementEdit(e.target.value)}
            className="w-full rounded-md border border-emerald-200 bg-white px-4 py-3 font-sans text-sm font-medium leading-relaxed text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* STEP 3 — Evaluate the Positioning */}
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Step 3 — Evaluate the Positioning
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Diagnostic check across five dimensions using only data entered in
              your Venture Profile, Competitor Matrix, and Positioning Map.
            </p>
          </div>

          <div className="font-mono text-xs tabular-nums text-slate-600">
            {strongCount} / {liveEvaluations.length} Strong
          </div>
        </div>

        {/* Important Evidence Rule Callouts */}
        {(hasNeedsEvidence || assumptionFlags.length > 0) && (
          <div className="mt-4 space-y-2.5">
            {hasNeedsEvidence && (
              <div className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs text-rose-950">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-700"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-mono font-bold tracking-wide text-rose-800">
                    NEEDS EVIDENCE
                  </span>
                  <p className="mt-0.5 leading-relaxed text-rose-900">
                    Your Reason to Believe is not yet backed by supporting
                    evidence or competitor research entered in the app. Ground
                    claims strictly in entered Venture Profile capabilities and
                    sourced Competitor Matrix records.
                  </p>
                </div>
              </div>
            )}

            {assumptionFlags.map((flag, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-950"
              >
                <FileWarning
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold text-amber-900">
                    Unverified Outcome Claim Flagged
                  </span>
                  <p className="mt-0.5 leading-relaxed text-amber-900">
                    {flag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5 Dimension Evaluation Cards */}
        <div className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
          {liveEvaluations.map((ev) => {
            const styles = getRatingStyles(ev.rating);
            return (
              <div
                key={ev.id}
                className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="text-xs font-semibold text-slate-900">
                      {ev.label}
                    </h4>
                    {ev.needsEvidence && (
                      <span className="font-mono text-[11px] font-bold tracking-wide text-rose-700">
                        NEEDS EVIDENCE
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {ev.explanation}
                  </p>
                </div>

                <div
                  className={`shrink-0 rounded border px-2.5 py-1 text-center text-xs font-semibold whitespace-nowrap ${styles.surface} ${styles.text}`}
                >
                  {ev.rating}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 4 — Revision & Progression */}
      <div className="px-6 py-5">
        {validationErrors.length > 0 && (
          <div className="mb-4 flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-700"
              aria-hidden="true"
            />
            <div>
              <span className="font-semibold">
                Complete all five positioning fields before saving:
              </span>{' '}
              {validationErrors.join(', ')}.
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            {statement.saved ? (
              <span className="font-medium text-emerald-800">
                Positioning statement saved — AI Strategy Challenge is now
                unlocked in Section 06. You can revise any field and save again
                at any time.
              </span>
            ) : isAllFiveComplete ? (
              <span>
                All 5 fields are populated. Save your positioning statement to
                persist revisions and unlock the AI Strategy Challenge.
              </span>
            ) : (
              <span>
                Complete all 5 fields above and save to unlock the AI Strategy
                Challenge.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Save Positioning Statement</span>
          </button>
        </div>
      </div>
    </section>
  );
}
