import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import type { VentureWorkspace } from '../../types/venture';

interface VentureBankViewProps {
  ventures: VentureWorkspace[];
  selectedVenture: VentureWorkspace | null;
  onSelectVenture: (ventureId: string) => void;
  onContinueToLab: () => void;
  onOpenSwitchVenture: () => void;
}

export function VentureBankView({
  ventures,
  selectedVenture,
  onSelectVenture,
  onContinueToLab,
  onOpenSwitchVenture,
}: VentureBankViewProps) {
  const hasMultipleVentures = ventures.length > 1;

  return (
    <div className="space-y-6">
      {/* Venture Bank Grid Section */}
      <section aria-labelledby="venture-bank-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1
              id="venture-bank-heading"
              className="font-display text-xl font-bold tracking-tight text-slate-900"
            >
              Venture Bank
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Select a venture profile to review its overview and proceed to Stage
              1 competitive analysis.
            </p>
          </div>

          {hasMultipleVentures && (
            <button
              type="button"
              onClick={onOpenSwitchVenture}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Switch Venture</span>
            </button>
          )}
        </div>

        {/* Responsive 3-4 column desktop grid, fewer on smaller screens */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ventures.map((venture) => {
            const isSelected = selectedVenture?.id === venture.id;
            const { ventureName, targetCustomer, problem, geography } =
              venture.ventureProfile;

            return (
              <article
                key={venture.id}
                className={`flex flex-col justify-between rounded-lg border p-4 transition-colors ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/25 ring-1 ring-emerald-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    {ventureName}
                  </h2>

                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Target Customer
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-800">
                      {targetCustomer}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Problem
                    </p>
                    <p
                      title={problem}
                      className="mt-0.5 truncate text-xs text-slate-700"
                    >
                      {problem}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Geography
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-800">
                      {geography}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectVenture(venture.id)}
                    aria-pressed={isSelected}
                    className={`inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                      isSelected
                        ? 'bg-[#0B162C] text-white'
                        : 'border border-slate-300 bg-white text-slate-800 hover:border-emerald-700 hover:bg-emerald-50/40 hover:text-emerald-900'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select Venture</span>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* MY SELECTED VENTURE Section */}
      {selectedVenture && (
        <section
          aria-labelledby="selected-venture-heading"
          className="rounded-lg border border-slate-200 bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h2
                id="selected-venture-heading"
                className="font-display text-sm font-bold tracking-wide text-slate-900"
              >
                MY SELECTED VENTURE
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Proposed venture profile — capabilities and outcomes require
                primary validation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {hasMultipleVentures && (
                <button
                  type="button"
                  onClick={onOpenSwitchVenture}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <span>Switch Venture</span>
                </button>
              )}

              <button
                type="button"
                onClick={onContinueToLab}
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <span>Continue to Competition Lab</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0">
            <div className="px-6 py-3.5 md:border-r md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">
                Venture Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {selectedVenture.ventureProfile.ventureName}
              </dd>
            </div>

            <div className="px-6 py-3.5">
              <dt className="text-xs font-medium text-slate-500">Category</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {selectedVenture.ventureProfile.businessCategory}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:border-t md:border-r md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">
                Target Customer
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-900">
                {selectedVenture.ventureProfile.targetCustomer}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:border-t md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">End Users</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-900">
                {selectedVenture.ventureProfile.endUsers}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:border-t md:border-r md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">Geography</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {selectedVenture.ventureProfile.geography}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:border-t md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">
                Revenue Model
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {selectedVenture.ventureProfile.revenueModel}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:col-span-2 md:border-t md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">Problem</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-900">
                {selectedVenture.ventureProfile.problem}
              </dd>
            </div>

            <div className="px-6 py-3.5 md:col-span-2 md:border-t md:border-slate-200">
              <dt className="text-xs font-medium text-slate-500">Offer</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-900">
                {selectedVenture.ventureProfile.offer}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
