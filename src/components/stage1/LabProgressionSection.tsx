import { CheckCircle2, Lock, RotateCcw } from 'lucide-react';
import { MIN_COMPLETED_FOR_POSITIONING_MAP } from '../../data/initialVentureData';

interface LabProgressionSectionProps {
  completedAlternativesCount: number;
  positioningStatementSaved: boolean;
  positioningStatementSavedAt: string | null;
  aiStrategyChallengeCompleted: boolean;
  aiStrategyChallengeCompletedAt: string | null;
  stage1Completed: boolean;
  stage1CompletedAt: string | null;
  onToggleStage1Complete: (complete: boolean) => void;
}

export function LabProgressionSection({
  completedAlternativesCount,
  positioningStatementSaved,
  positioningStatementSavedAt,
  aiStrategyChallengeCompleted,
  aiStrategyChallengeCompletedAt,
  stage1Completed,
  stage1CompletedAt,
  onToggleStage1Complete,
}: LabProgressionSectionProps) {
  const isPositioningMapUnlocked =
    completedAlternativesCount >= MIN_COMPLETED_FOR_POSITIONING_MAP;

  return (
    <section
      id="lab-progression"
      aria-labelledby="lab-progression-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="lab-progression-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              07. Competition Lab Progression
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Strategy modules progress sequentially from evidence-based
              competitor research and positioning statement to the AI Strategy
              Challenge and Competition War Room.
            </p>
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-600">
            {completedAlternativesCount} / {MIN_COMPLETED_FOR_POSITIONING_MAP}{' '}
            completed alternatives
          </div>
        </div>
      </div>

      {/* Sequenced Progression Modules */}
      <div className="divide-y divide-slate-200">
        {/* Step 1: Positioning Map */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Positioning Map (Market Battlefield)
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                {isPositioningMapUnlocked
                  ? `Active in Section 04 — ${completedAlternativesCount} completed alternatives recorded.`
                  : 'Active in Section 04 — Place MessMind and researched alternatives on the map.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-700">
            Unlocked
          </span>
        </div>

        {/* Step 2: Positioning Statement */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Positioning Statement
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                {positioningStatementSaved
                  ? `Saved${
                      positioningStatementSavedAt
                        ? ` on ${new Date(
                            positioningStatementSavedAt
                          ).toLocaleDateString()}`
                        : ''
                    } — Complete 5-part positioning statement persisted.`
                  : 'Unlocked in Section 05 — Complete and save all five positioning components to unlock the AI Strategy Challenge.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-emerald-700">
            {positioningStatementSaved ? 'Saved' : 'Unlocked'}
          </span>
        </div>

        {/* Step 3: AI Strategy Challenge */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 ${
            positioningStatementSaved ? '' : 'bg-slate-50/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {positioningStatementSaved ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
            ) : (
              <Lock
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            )}
            <div>
              <h3
                className={`text-sm font-semibold ${
                  positioningStatementSaved
                    ? 'text-slate-900'
                    : 'text-slate-700'
                }`}
              >
                AI Strategy Challenge
              </h3>
              <p
                className={`mt-0.5 text-xs ${
                  positioningStatementSaved
                    ? 'text-slate-600'
                    : 'text-slate-500'
                }`}
              >
                {aiStrategyChallengeCompleted
                  ? `Completed${
                      aiStrategyChallengeCompletedAt
                        ? ` on ${new Date(
                            aiStrategyChallengeCompletedAt
                          ).toLocaleDateString()}`
                        : ''
                    } — All 3 strategy challenges defended and Final Strategy Review recorded.`
                  : positioningStatementSaved
                    ? 'Active in Section 06 — Complete all 3 Gemini challenge defences to unlock Competition War Room.'
                    : 'AI Strategy Challenge — Complete the positioning statement first.'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold ${
              positioningStatementSaved ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {aiStrategyChallengeCompleted
              ? 'Completed'
              : positioningStatementSaved
                ? 'Unlocked'
                : 'Locked'}
          </span>
        </div>

        {/* Step 4: Competition War Room */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 ${
            aiStrategyChallengeCompleted ? 'bg-emerald-50/30' : 'bg-slate-50/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {aiStrategyChallengeCompleted ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
            ) : (
              <Lock
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            )}
            <div>
              <h3
                className={`text-sm font-semibold ${
                  aiStrategyChallengeCompleted
                    ? 'text-slate-900'
                    : 'text-slate-700'
                }`}
              >
                Competition War Room
              </h3>
              <p
                className={`mt-0.5 text-xs ${
                  aiStrategyChallengeCompleted
                    ? 'text-emerald-800'
                    : 'text-slate-500'
                }`}
              >
                {aiStrategyChallengeCompleted
                  ? 'Unlocked — All 3 AI Strategy Challenge questions completed. Competition War Room is ready for the next session.'
                  : 'Competition War Room — Complete the AI Strategy Challenge first.'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold ${
              aiStrategyChallengeCompleted
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
          >
            {aiStrategyChallengeCompleted ? 'Unlocked' : 'Locked'}
          </span>
        </div>
      </div>

      {/* Stage 1 Completion Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-6 py-4">
        <div className="text-xs text-slate-600">
          {stage1Completed ? (
            <span>
              Stage 1 marked complete
              {stage1CompletedAt
                ? ` on ${new Date(stage1CompletedAt).toLocaleDateString()}`
                : ''}
              .
            </span>
          ) : positioningStatementSaved &&
            isPositioningMapUnlocked &&
            aiStrategyChallengeCompleted ? (
            <span>
              Competitor research, positioning statement, and AI Strategy
              Challenge are complete. You can mark Stage 1 complete or continue
              refining your strategy.
            </span>
          ) : (
            <span>
              Complete at least {MIN_COMPLETED_FOR_POSITIONING_MAP} alternatives
              with full evidence, save your Positioning Statement, and complete
              the AI Strategy Challenge to finish Stage 1.
            </span>
          )}
        </div>

        <div className="shrink-0">
          {stage1Completed ? (
            <button
              type="button"
              onClick={() => onToggleStage1Complete(false)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reopen Stage 1</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!isPositioningMapUnlocked || !positioningStatementSaved}
              onClick={() => onToggleStage1Complete(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Complete Stage 1 Research & Positioning</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
