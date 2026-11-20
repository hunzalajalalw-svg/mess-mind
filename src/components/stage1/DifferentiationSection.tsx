import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { DifferentiationProfile } from '../../types/venture';

interface DifferentiationSectionProps {
  differentiation: DifferentiationProfile;
  onSave: (nextDifferentiation: DifferentiationProfile) => void;
}

const DIFFERENTIATION_FIELDS: {
  key: Exclude<keyof DifferentiationProfile, 'positioningStatement'>;
  label: string;
  helper: string;
}[] = [
  {
    key: 'coreCustomerProblem',
    label: 'Core Customer Problem',
    helper: 'What urgent operational pain does the buyer face daily?',
  },
  {
    key: 'primaryDifferentiator',
    label: 'Primary Differentiator',
    helper: 'What single mechanism separates MessMind from existing options?',
  },
  {
    key: 'uniqueValueProposition',
    label: 'Unique Value Proposition',
    helper: 'Clear, measurable outcome delivered to colleges and mess teams.',
  },
  {
    key: 'keyCompetitiveAdvantage',
    label: 'Key Competitive Advantage',
    helper: 'Why MessMind wins against generic software or manual habits.',
  },
  {
    key: 'whyChooseMessMind',
    label: 'Why Institutions Should Choose MessMind',
    helper: 'Decision rationale for hostel administrators and mess contractors.',
  },
  {
    key: 'barriersToImitation',
    label: 'Barriers to Imitation',
    helper: 'What makes this position harder to copy over time?',
  },
];

export function DifferentiationSection({
  differentiation,
  onSave,
}: DifferentiationSectionProps) {
  const [draft, setDraft] = useState<DifferentiationProfile>(differentiation);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraft(differentiation);
  }, [differentiation]);

  const isDirty =
    JSON.stringify(draft) !== JSON.stringify(differentiation);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2600);
  };

  return (
    <section
      id="differentiation-uvp"
      aria-labelledby="differentiation-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="max-w-2xl">
          <h2
            id="differentiation-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            04. Differentiation &amp; Unique Value Proposition
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Define MessMind&apos;s defendable differentiation and refine the
            core positioning statement for institutional buyers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {justSaved && !isDirty && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
          {isDirty && (
            <span className="text-xs font-medium text-amber-700">
              Unsaved edits
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Positioning Statement Block */}
        <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="positioning-statement-input"
              className="text-xs font-semibold tracking-wide text-emerald-950"
            >
              Positioning Statement
            </label>
          </div>
          <textarea
            id="positioning-statement-input"
            rows={3}
            required
            value={draft.positioningStatement}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                positioningStatement: e.target.value,
              }))
            }
            className="mt-2 w-full rounded-md border border-emerald-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
          />
          <p className="mt-2 text-xs text-slate-600">
            Target statement framing MessMind&apos;s proposed market position
            for validation in customer discovery.
          </p>
        </div>

        {/* Six Strategy Fields */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {DIFFERENTIATION_FIELDS.map((field) => {
            const inputId = `diff-${field.key}`;
            return (
              <div key={field.key}>
                <label
                  htmlFor={inputId}
                  className="block text-xs font-semibold text-slate-800"
                >
                  {field.label}
                </label>
                <p className="mt-0.5 text-xs text-slate-500">{field.helper}</p>
                <textarea
                  id={inputId}
                  rows={3}
                  required
                  value={draft[field.key]}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Changes sync immediately with the Final Stage Summary once saved.
          </p>
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={() => setDraft(differentiation)}
                className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Discard Edits
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save Differentiation</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
