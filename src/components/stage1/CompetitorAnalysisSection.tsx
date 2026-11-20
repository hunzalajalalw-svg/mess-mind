import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ALTERNATIVE_TYPES,
  EVIDENCE_QUALITY_GUIDE,
  MAX_ALTERNATIVES,
} from '../../data/initialVentureData';
import {
  isAlternativeCompleted,
  isAlternativePopulated,
} from '../../hooks/useVentureStudio';
import type {
  AlternativeRecord,
  AlternativeType,
  EvidenceQuality,
} from '../../types/venture';
import { ConfirmModal } from '../common/ConfirmModal';

interface CompetitorAnalysisSectionProps {
  alternatives: AlternativeRecord[];
  onAddBlank: () => void;
  onUpdate: (alternative: AlternativeRecord, feedbackMessage?: string) => void;
  onDelete: (id: string) => void;
}

function getEvidenceQualityTextClass(quality: EvidenceQuality | ''): string {
  switch (quality) {
    case 'Strong':
      return 'text-emerald-700 font-semibold';
    case 'Moderate':
      return 'text-slate-800 font-semibold';
    case 'Weak':
      return 'text-amber-700 font-semibold';
    default:
      return 'text-slate-400';
  }
}

export function CompetitorAnalysisSection({
  alternatives,
  onAddBlank,
  onUpdate,
  onDelete,
}: CompetitorAnalysisSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<
    'all' | 'unassigned' | EvidenceQuality
  >('all');
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<AlternativeRecord | null>(
    null
  );

  const filteredAlternatives = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return alternatives.filter((alt) => {
      const matchesQuality =
        qualityFilter === 'all'
          ? true
          : qualityFilter === 'unassigned'
            ? alt.evidenceQuality === ''
            : alt.evidenceQuality === qualityFilter;
      if (!matchesQuality) return false;
      if (!query) return true;
      return (
        alt.name.toLowerCase().includes(query) ||
        alt.type.toLowerCase().includes(query) ||
        alt.approximatePrice.toLowerCase().includes(query) ||
        alt.mainOffer.toLowerCase().includes(query) ||
        alt.strengths.toLowerCase().includes(query) ||
        alt.weaknesses.toLowerCase().includes(query) ||
        alt.evidenceSource.toLowerCase().includes(query)
      );
    });
  }, [alternatives, searchQuery, qualityFilter]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = <K extends keyof AlternativeRecord>(
    record: AlternativeRecord,
    field: K,
    value: AlternativeRecord[K]
  ) => {
    onUpdate(
      {
        ...record,
        [field]: value,
      },
      'Research saved locally'
    );
  };

  const handleRequestDelete = (alt: AlternativeRecord) => {
    if (!isAlternativePopulated(alt)) {
      onDelete(alt.id);
      return;
    }
    setDeleteTarget(alt);
  };

  const atMaxLimit = alternatives.length >= MAX_ALTERNATIVES;
  const completedCount = alternatives.filter(isAlternativeCompleted).length;

  return (
    <section
      id="competitor-analysis"
      aria-labelledby="competitor-analysis-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="max-w-2xl">
          <h2
            id="competitor-analysis-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            02. Competitor Research Workspace
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Enter actual market alternatives you have researched. Start with
            three blank records and add up to six. Complete all required fields
            and select an Evidence Quality rating before a record counts as
            researched.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs tabular-nums text-slate-600">
            {completedCount} completed · {alternatives.length}/{MAX_ALTERNATIVES}{' '}
            slots
          </span>
          <button
            type="button"
            disabled={atMaxLimit}
            onClick={onAddBlank}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{atMaxLimit ? 'Maximum 6 Reached' : 'Add Alternative'}</span>
          </button>
        </div>
      </div>

      {/* Evidence Quality Definitions Guide */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
        <p className="text-xs font-semibold text-slate-800">
          Evidence Quality Definitions
        </p>
        <dl className="mt-2 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
          {EVIDENCE_QUALITY_GUIDE.map((item) => (
            <div key={item.value} className="leading-relaxed text-slate-700">
              <dt
                className={`inline font-semibold ${getEvidenceQualityTextClass(
                  item.value
                )}`}
              >
                {item.label} ={' '}
              </dt>
              <dd className="inline">{item.explanation}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter your entered records"
            aria-label="Filter your entered records"
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div
          className="flex flex-wrap items-center gap-1 rounded-md bg-slate-100 p-1"
          role="group"
          aria-label="Filter by evidence quality"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'Strong', label: 'Strong' },
              { id: 'Moderate', label: 'Moderate' },
              { id: 'Weak', label: 'Weak' },
              { id: 'unassigned', label: 'Evidence required' },
            ] as const
          ).map((option) => {
            const active = qualityFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setQualityFilter(option.id)}
                className={`whitespace-nowrap shrink-0 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alternative Records List */}
      {filteredAlternatives.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            No alternative records match the current filter
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Clear your filter or add a blank alternative slot to enter
            competitor research.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {(searchQuery || qualityFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setQualityFilter('all');
                }}
                className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
            {alternatives.length === 0 && (
              <button
                type="button"
                onClick={onAddBlank}
                className="whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-800"
              >
                Add Blank Alternative
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filteredAlternatives.map((alt) => {
            const originalIndex = alternatives.findIndex((a) => a.id === alt.id);
            const slotNumber = originalIndex >= 0 ? originalIndex + 1 : 1;
            const isCollapsed = Boolean(collapsedIds[alt.id]);
            const isComplete = isAlternativeCompleted(alt);
            const isPopulated = isAlternativePopulated(alt);
            const displayTitle = alt.name.trim()
              ? alt.name
              : `Alternative ${slotNumber}`;

            return (
              <div key={alt.id} className="bg-white">
                {/* Record Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(alt.id)}
                    aria-expanded={!isCollapsed}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    {isCollapsed ? (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                      0{slotNumber}.
                    </span>
                    <span
                      className={`truncate text-sm font-semibold ${
                        alt.name.trim() ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {displayTitle}
                    </span>
                  </button>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span className="hidden text-slate-600 sm:inline">
                      {alt.type || 'Evidence required'}
                    </span>
                    <span
                      className="hidden text-slate-300 sm:inline"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <span
                      className={`hidden md:inline ${getEvidenceQualityTextClass(
                        alt.evidenceQuality
                      )}`}
                    >
                      {alt.evidenceQuality
                        ? `Evidence: ${alt.evidenceQuality}`
                        : 'Evidence required'}
                    </span>
                    <span
                      className="hidden text-slate-300 md:inline"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        {isPopulated ? 'Incomplete' : 'Blank record'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRequestDelete(alt)}
                      className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
                      aria-label={`Remove ${displayTitle}`}
                      title="Remove alternative record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Editable Fields */}
                {!isCollapsed && (
                  <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label
                          htmlFor={`${alt.id}-name`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          1. Competitor / Alternative Name{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`${alt.id}-name`}
                          type="text"
                          value={alt.name}
                          onChange={(e) =>
                            handleFieldChange(alt, 'name', e.target.value)
                          }
                          placeholder="Enter researched name"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${alt.id}-type`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          2. Type <span className="text-red-600">*</span>
                        </label>
                        <select
                          id={`${alt.id}-type`}
                          value={alt.type}
                          onChange={(e) =>
                            handleFieldChange(
                              alt,
                              'type',
                              e.target.value as AlternativeType | ''
                            )
                          }
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        >
                          <option value="">Select type...</option>
                          {ALTERNATIVE_TYPES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={`${alt.id}-price`}
                            className="block text-xs font-semibold text-slate-700"
                          >
                            3. Approximate Price / Cost
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleFieldChange(
                                alt,
                                'approximatePrice',
                                alt.approximatePrice === 'Not applicable'
                                  ? ''
                                  : 'Not applicable'
                              )
                            }
                            className={`whitespace-nowrap text-[11px] font-medium transition-colors ${
                              alt.approximatePrice === 'Not applicable'
                                ? 'text-emerald-700 underline'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {alt.approximatePrice === 'Not applicable'
                              ? 'Clear "Not applicable"'
                              : 'Mark "Not applicable"'}
                          </button>
                        </div>
                        <input
                          id={`${alt.id}-price`}
                          type="text"
                          value={alt.approximatePrice}
                          onChange={(e) =>
                            handleFieldChange(
                              alt,
                              'approximatePrice',
                              e.target.value
                            )
                          }
                          placeholder="Enter price/cost or mark Not applicable"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                      </div>

                      <div className="lg:col-span-3">
                        <label
                          htmlFor={`${alt.id}-offer`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          4. Main Offer <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id={`${alt.id}-offer`}
                          rows={2}
                          value={alt.mainOffer}
                          onChange={(e) =>
                            handleFieldChange(alt, 'mainOffer', e.target.value)
                          }
                          placeholder="Describe what they offer based on your research"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                      </div>

                      <div className="lg:col-span-1">
                        <label
                          htmlFor={`${alt.id}-strength`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          5. Main Strength{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id={`${alt.id}-strength`}
                          rows={2}
                          value={alt.strengths}
                          onChange={(e) =>
                            handleFieldChange(alt, 'strengths', e.target.value)
                          }
                          placeholder="Document observed strength"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label
                          htmlFor={`${alt.id}-weakness`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          6. Main Weakness{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id={`${alt.id}-weakness`}
                          rows={2}
                          value={alt.weaknesses}
                          onChange={(e) =>
                            handleFieldChange(alt, 'weaknesses', e.target.value)
                          }
                          placeholder="Document observed weakness or gap"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label
                          htmlFor={`${alt.id}-source`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          7. Evidence / Source{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <input
                          id={`${alt.id}-source`}
                          type="text"
                          value={alt.evidenceSource}
                          onChange={(e) =>
                            handleFieldChange(
                              alt,
                              'evidenceSource',
                              e.target.value
                            )
                          }
                          placeholder="Website URL, product/pricing page, app listing, review source, or observation note"
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                          Accepted: Website URL, product page, pricing page, app
                          listing, review source, observation note, or other
                          relevant evidence.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor={`${alt.id}-quality`}
                          className="block text-xs font-semibold text-slate-700"
                        >
                          8. Evidence Quality{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <select
                          id={`${alt.id}-quality`}
                          value={alt.evidenceQuality}
                          onChange={(e) =>
                            handleFieldChange(
                              alt,
                              'evidenceQuality',
                              e.target.value as EvidenceQuality | ''
                            )
                          }
                          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        >
                          <option value="">Select evidence quality...</option>
                          <option value="Strong">Strong</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Weak">Weak</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove alternative from research?"
        description={
          deleteTarget
            ? `This will remove "${
                deleteTarget.name.trim() || 'this alternative record'
              }" and its entered research from this venture.`
            : ''
        }
        confirmLabel="Remove"
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </section>
  );
}
