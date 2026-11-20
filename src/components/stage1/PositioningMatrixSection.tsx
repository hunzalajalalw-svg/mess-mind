import { useMemo } from 'react';
import { isAlternativeCompleted } from '../../hooks/useVentureStudio';
import type { AlternativeRecord, EvidenceQuality } from '../../types/venture';

interface PositioningMatrixSectionProps {
  alternatives: AlternativeRecord[];
}

function getQualityTextColor(quality: EvidenceQuality | ''): string {
  switch (quality) {
    case 'Strong':
      return 'text-emerald-700 font-semibold';
    case 'Moderate':
      return 'text-slate-800 font-semibold';
    case 'Weak':
      return 'text-amber-700 font-semibold';
    default:
      return 'text-slate-400 italic';
  }
}

function formatCellValue(value: string): { text: string; empty: boolean } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { text: 'Evidence required', empty: true };
  }
  return { text: trimmed, empty: false };
}

export function PositioningMatrixSection({
  alternatives,
}: PositioningMatrixSectionProps) {
  const summaryStats = useMemo(() => {
    // Strict Completion Rule: counts and overall evidence quality are derived ONLY from completed records
    const completed = alternatives.filter(isAlternativeCompleted);
    const directCount = completed.filter(
      (a) => a.type === 'Direct Competitor'
    ).length;
    const indirectCount = completed.filter(
      (a) => a.type === 'Indirect Competitor'
    ).length;
    const substituteCount = completed.filter(
      (a) => a.type === 'Substitute'
    ).length;
    const doNothingCount = completed.filter(
      (a) => a.type === 'Do Nothing'
    ).length;

    const strongCount = completed.filter(
      (a) => a.evidenceQuality === 'Strong'
    ).length;
    const moderateCount = completed.filter(
      (a) => a.evidenceQuality === 'Moderate'
    ).length;
    const weakCount = completed.filter(
      (a) => a.evidenceQuality === 'Weak'
    ).length;

    let overallQualityLabel = 'Evidence required';
    let overallQualityDetail = 'No completed records yet';

    if (completed.length > 0) {
      const scoreSum = strongCount * 3 + moderateCount * 2 + weakCount * 1;
      const avg = scoreSum / completed.length;
      if (avg >= 2.5) {
        overallQualityLabel = 'Strong';
      } else if (avg >= 1.75) {
        overallQualityLabel = 'Moderate';
      } else {
        overallQualityLabel = 'Weak';
      }
      overallQualityDetail = `${strongCount} Strong · ${moderateCount} Moderate · ${weakCount} Weak`;
    }

    return {
      researchedCount: completed.length,
      directCount,
      indirectCount,
      substituteCount,
      doNothingCount,
      overallQualityLabel,
      overallQualityDetail,
    };
  }, [alternatives]);

  const MATRIX_ROWS: {
    key: string;
    label: string;
    getValue: (alt: AlternativeRecord) => string;
  }[] = [
    { key: 'type', label: 'Type', getValue: (alt) => alt.type },
    {
      key: 'price',
      label: 'Approximate Price / Cost',
      getValue: (alt) => alt.approximatePrice,
    },
    {
      key: 'offer',
      label: 'Main Offer',
      getValue: (alt) => alt.mainOffer,
    },
    {
      key: 'strength',
      label: 'Main Strength',
      getValue: (alt) => alt.strengths,
    },
    {
      key: 'weakness',
      label: 'Main Weakness',
      getValue: (alt) => alt.weaknesses,
    },
    {
      key: 'source',
      label: 'Evidence / Source',
      getValue: (alt) => alt.evidenceSource,
    },
    {
      key: 'quality',
      label: 'Evidence Quality',
      getValue: (alt) => alt.evidenceQuality,
    },
  ];

  return (
    <section
      id="competitor-matrix"
      aria-labelledby="competitor-matrix-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="max-w-3xl">
          <h2
            id="competitor-matrix-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            03. Competitor Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Comparison matrix generated strictly from your entered research.
            Empty fields display{' '}
            <span className="font-medium text-slate-900">
              Evidence required
            </span>
            . Summary counts and Overall Evidence Quality reflect completed
            records only.
          </p>
        </div>

        {/* Summary Metrics Above Matrix */}
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Alternatives researched
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {summaryStats.researchedCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Direct competitors
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {summaryStats.directCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Indirect competitors
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {summaryStats.indirectCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Substitutes</dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {summaryStats.substituteCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Do-Nothing alternatives
            </dt>
            <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {summaryStats.doNothingCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">
              Overall evidence quality
            </dt>
            <dd
              className={`mt-1 text-base ${
                summaryStats.researchedCount === 0
                  ? 'text-slate-500'
                  : getQualityTextColor(
                      summaryStats.overallQualityLabel as EvidenceQuality
                    )
              }`}
            >
              {summaryStats.overallQualityLabel}
            </dd>
            <dd className="mt-0.5 text-[11px] tabular-nums text-slate-500">
              {summaryStats.overallQualityDetail}
            </dd>
          </div>
        </dl>
      </div>

      {/* User-Entry Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                className="sticky left-0 z-10 w-56 border-r border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-semibold text-slate-700"
              >
                Research Dimension
              </th>
              {alternatives.map((alt, idx) => {
                const isCompleted = isAlternativeCompleted(alt);
                return (
                  <th
                    key={alt.id}
                    scope="col"
                    className="min-w-[190px] border-r border-slate-200 px-4 py-3.5 text-xs font-semibold text-slate-900 last:border-r-0"
                  >
                    <div className="line-clamp-2 leading-snug">
                      {alt.name.trim() || `Alternative ${idx + 1}`}
                    </div>
                    <div className="mt-1 text-[11px] font-normal">
                      <span className="text-slate-500">Evidence Quality: </span>
                      <span className={getQualityTextColor(alt.evidenceQuality)}>
                        {alt.evidenceQuality || 'Evidence required'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-normal text-slate-500">
                      {isCompleted ? 'Completed record' : 'Incomplete record'}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {MATRIX_ROWS.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50/50">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-slate-200 bg-white px-6 py-3.5 align-top text-xs font-semibold text-slate-700"
                >
                  {row.label}
                </th>
                {alternatives.map((alt) => {
                  const res = formatCellValue(row.getValue(alt));
                  const isQualityRow = row.key === 'quality';
                  return (
                    <td
                      key={`${alt.id}-${row.key}`}
                      className="border-r border-slate-200 px-4 py-3.5 align-top text-xs leading-relaxed last:border-r-0"
                    >
                      {res.empty ? (
                        <span className="italic text-slate-400">
                          Evidence required
                        </span>
                      ) : isQualityRow ? (
                        <span
                          className={getQualityTextColor(alt.evidenceQuality)}
                        >
                          {res.text}
                        </span>
                      ) : (
                        <span className="text-slate-800 break-words">
                          {res.text}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
