import { CheckCircle2, Lock, X } from 'lucide-react';
import { VENTURE_STAGES } from '../../config/stages';
import type { Stage1SectionId, StageId } from '../../types/venture';

interface SidebarProps {
  ventureName: string;
  geography: string;
  selectedStageId: StageId;
  activeSectionId: Stage1SectionId;
  stage1Completed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectSection: (sectionId: Stage1SectionId) => void;
}

export function Sidebar({
  ventureName,
  geography,
  selectedStageId,
  activeSectionId,
  stage1Completed,
  mobileOpen,
  onCloseMobile,
  onSelectSection,
}: SidebarProps) {
  const stage1 = VENTURE_STAGES[0];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0B162C] text-slate-100">
      {/* Brand Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 px-5 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-600 font-display text-sm font-bold text-white">
              M
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-white">
                {ventureName || 'MessMind'}
              </p>
              <p className="truncate text-xs text-slate-400">Venture Studio</p>
            </div>
          </div>
          <p className="mt-3 truncate text-xs text-slate-400">
            {geography} · B2B SaaS
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Development Stages */}
      <nav
        aria-label="Venture development stages"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <p className="px-2.5 text-xs font-medium tracking-wide text-slate-400">
          Development Stages
        </p>

        <div className="mt-3 space-y-1.5">
          {VENTURE_STAGES.map((stage) => {
            const isActive =
              stage.status === 'active' && selectedStageId === stage.id;
            const isLocked = stage.status === 'coming_next';

            if (isLocked) {
              return (
                <div
                  key={stage.id}
                  aria-disabled="true"
                  className="flex items-start justify-between gap-2 rounded-md px-2.5 py-2.5 text-slate-400/80"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-slate-500">
                        0{stage.order}
                      </span>
                      <span className="truncate text-sm font-medium text-slate-400">
                        {stage.title}
                      </span>
                    </div>
                    <p className="mt-0.5 pl-6 text-xs text-slate-500">
                      Coming Next
                    </p>
                  </div>
                  <Lock
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                </div>
              );
            }

            return (
              <div
                key={stage.id}
                className="rounded-md bg-slate-900/90 ring-1 ring-emerald-500/30"
              >
                <div className="flex items-start justify-between gap-2 px-2.5 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold tabular-nums text-emerald-400">
                        0{stage.order}
                      </span>
                      <span className="truncate text-sm font-semibold text-white">
                        {stage.title}
                      </span>
                    </div>
                    <p className="mt-0.5 pl-6 text-xs text-emerald-300">
                      {stage1Completed ? 'Completed' : 'Active Stage'}
                    </p>
                  </div>
                  {stage1Completed && (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      aria-label="Stage 1 complete"
                    />
                  )}
                </div>

                {/* Stage 1 Section Jump Links */}
                {isActive && stage1.sections && (
                  <div className="border-t border-slate-800/80 px-2 py-2 space-y-0.5">
                    {stage1.sections.map((section) => {
                      const isCurrentSection = activeSectionId === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => {
                            onSelectSection(section.id);
                            onCloseMobile();
                          }}
                          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                            isCurrentSection
                              ? 'bg-emerald-600/20 font-medium text-emerald-300'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          }`}
                        >
                          <span className="font-mono text-[11px] tabular-nums text-slate-400">
                            {section.number}.
                          </span>
                          <span className="truncate">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer note */}
      <div className="border-t border-slate-800/80 px-5 py-4 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Workspace Continuity</p>
        <p className="mt-1 leading-relaxed text-slate-400">
          Stage 1 progress saves locally in this browser across venture sessions.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-[264px] shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Stage navigation"
        >
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
