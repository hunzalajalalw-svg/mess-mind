import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Swords,
} from 'lucide-react';
import { isAlternativeCompleted } from '../../hooks/useVentureStudio';
import type {
  AIStrategyChallengeData,
  AlternativeRecord,
  PositioningStatementData,
  StrategicCoordinate,
  StrategyChallengeFeedback,
  StrategyChallengeItem,
  StrategyChallengeReview,
  VentureProfile,
} from '../../types/venture';

interface AIStrategyChallengeSectionProps {
  ventureProfile: VentureProfile;
  alternatives: AlternativeRecord[];
  messMindPosition: StrategicCoordinate | null;
  positioningStatement: PositioningStatementData;
  challengeData: AIStrategyChallengeData;
  onUpdateChallenge: (
    next: AIStrategyChallengeData,
    feedbackMessage?: string
  ) => void;
}

export function AIStrategyChallengeSection({
  ventureProfile,
  alternatives,
  messMindPosition,
  positioningStatement,
  challengeData,
  onUpdateChallenge,
}: AIStrategyChallengeSectionProps) {
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const isUnlocked = positioningStatement.saved;

  const namedAlternatives = useMemo(
    () => alternatives.filter((alt) => alt.name.trim() !== ''),
    [alternatives]
  );
  const completedAlternativesCount = useMemo(
    () => alternatives.filter(isAlternativeCompleted).length,
    [alternatives]
  );
  const mappedAlternativesCount = useMemo(
    () => namedAlternatives.filter((alt) => alt.position !== null).length,
    [namedAlternatives]
  );

  const workspaceContextPayload = useMemo(
    () => ({
      ventureProfile,
      alternatives,
      messMindPosition,
      positioningStatement,
    }),
    [ventureProfile, alternatives, messMindPosition, positioningStatement]
  );

  const challenges = challengeData.challenges;
  const activeIndex =
    challenges.length > 0
      ? Math.max(0, Math.min(challenges.length - 1, challengeData.currentIndex))
      : 0;
  const currentChallenge: StrategyChallengeItem | null =
    challenges[activeIndex] ?? null;

  const answeredWithFeedbackCount = challenges.filter(
    (c) => c.feedback !== null
  ).length;
  const allThreeHaveFeedback =
    challenges.length === 3 && answeredWithFeedbackCount === 3;

  const handleGenerateQuestions = async () => {
    setErrorMessage(null);
    setConfirmRestart(false);
    setLoadingQuestions(true);

    try {
      const res = await fetch('/api/strategy-challenge/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceContext: workspaceContextPayload }),
      });

      const data = (await res.json()) as {
        questions?: Array<{
          id: string;
          focusArea: string;
          question: string;
          contextBasis: string;
        }>;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(
          data.error || 'Unable to generate strategy challenge questions.'
        );
      }

      const items: StrategyChallengeItem[] = (data.questions ?? [])
        .slice(0, 3)
        .map((q, idx) => ({
          id: q.id || `challenge-${idx + 1}`,
          focusArea: q.focusArea || `Challenge ${idx + 1}`,
          question: q.question,
          contextBasis: q.contextBasis || '',
          userResponse: '',
          feedback: null,
        }));

      if (items.length < 3) {
        throw new Error('Expected 3 challenge questions from Gemini.');
      }

      onUpdateChallenge(
        {
          challenges: items,
          currentIndex: 0,
          review: null,
          completed: false,
          completedAt: null,
          generatedAt: new Date().toISOString(),
        },
        '3 strategy challenges generated'
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to generate strategy challenges.'
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleResponseChange = (value: string) => {
    if (!currentChallenge) return;
    const nextChallenges = challenges.map((item, idx) =>
      idx === activeIndex ? { ...item, userResponse: value } : item
    );
    onUpdateChallenge({
      ...challengeData,
      challenges: nextChallenges,
    });
  };

  const handleSubmitDefence = async () => {
    if (!currentChallenge || !currentChallenge.userResponse.trim()) return;
    setErrorMessage(null);
    setLoadingFeedback(true);

    try {
      const res = await fetch('/api/strategy-challenge/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceContext: workspaceContextPayload,
          question: {
            focusArea: currentChallenge.focusArea,
            question: currentChallenge.question,
          },
          defense: currentChallenge.userResponse,
        }),
      });

      const data = (await res.json()) as {
        feedback?: StrategyChallengeFeedback;
        error?: string;
      };

      if (!res.ok || !data.feedback) {
        throw new Error(
          data.error || 'Unable to evaluate your defence right now.'
        );
      }

      const nextChallenges = challenges.map((item, idx) =>
        idx === activeIndex ? { ...item, feedback: data.feedback ?? null } : item
      );

      onUpdateChallenge(
        {
          ...challengeData,
          challenges: nextChallenges,
        },
        `Challenge ${activeIndex + 1} feedback saved`
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to submit defence for feedback.'
      );
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSelectChallengeIndex = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= challenges.length) return;
    setErrorMessage(null);
    onUpdateChallenge({
      ...challengeData,
      currentIndex: nextIdx,
    });
  };

  const handleGenerateFinalReview = async () => {
    if (!allThreeHaveFeedback) return;
    setErrorMessage(null);
    setLoadingReview(true);

    try {
      const res = await fetch('/api/strategy-challenge/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceContext: workspaceContextPayload,
          challenges,
        }),
      });

      const data = (await res.json()) as {
        review?: StrategyChallengeReview;
        error?: string;
      };

      if (!res.ok || !data.review) {
        throw new Error(
          data.error || 'Unable to generate final strategy review.'
        );
      }

      onUpdateChallenge(
        {
          ...challengeData,
          review: data.review,
          completed: true,
          completedAt: new Date().toISOString(),
        },
        'Strategy Challenge complete — Competition War Room unlocked'
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to generate final strategy review.'
      );
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <section
      id="ai-strategy-challenge"
      aria-labelledby="ai-strategy-challenge-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      {/* Header & Purpose */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2
              id="ai-strategy-challenge-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              06. AI Strategy Challenge
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              The AI Strategy Challenge tests whether your competitive position
              is logically defensible and supported by evidence.
            </p>
          </div>

          <div className="font-mono text-xs tabular-nums text-slate-600">
            {!isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-slate-500">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Locked</span>
              </span>
            ) : challengeData.completed ? (
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Strategy Challenge Complete</span>
              </span>
            ) : challenges.length > 0 ? (
              <span>
                Challenge {activeIndex + 1} of {challenges.length}
              </span>
            ) : (
              <span>Unlocked · Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Locked State */}
      {!isUnlocked ? (
        <div className="px-6 py-8">
          <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-4">
            <Lock
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Complete Positioning Statement First
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Save a complete five-part Positioning Statement in Section 05 to
                unlock the AI Strategy Challenge. Gemini will then review your
                entered Venture Profile, Competitor Research, Matrix,
                Positioning Map, and Positioning Statement to test your
                reasoning.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Step 1 — Existing Workspace Information Reviewed */}
          <div className="border-b border-slate-200 bg-slate-50/40 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  Evidence Scope Reviewed by Gemini:{' '}
                </span>
                Only your entered data — Venture Profile (
                {ventureProfile.ventureName}), {namedAlternatives.length} named
                alternatives ({completedAlternativesCount} completed with
                evidence),{' '}
                {messMindPosition
                  ? `MessMind plotted at (${messMindPosition.x}, ${messMindPosition.y})`
                  : 'MessMind not yet plotted'}
                , {mappedAlternativesCount} alternatives mapped, and your saved
                Positioning Statement.
              </div>

              {challenges.length > 0 && (
                <div className="shrink-0">
                  {confirmRestart ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">
                        Replace current 3 challenges?
                      </span>
                      <button
                        type="button"
                        onClick={handleGenerateQuestions}
                        disabled={loadingQuestions}
                        className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRestart(false)}
                        className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRestart(true)}
                      disabled={loadingQuestions || loadingFeedback || loadingReview}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>New 3 Challenges</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="border-b border-rose-200 bg-rose-50 px-6 py-3">
              <div className="flex items-start gap-2.5 text-xs text-rose-900">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-700"
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Step 2 — Initial "Challenge My Strategy" Trigger */}
          {challenges.length === 0 ? (
            <div className="px-6 py-8">
              <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-slate-50/60 p-6 text-center">
                <Swords
                  className="mx-auto h-6 w-6 text-slate-700"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-display text-base font-semibold text-slate-900">
                  Stress-Test Your Competitive Position
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Gemini will examine your entered research, positioning map,
                  and positioning statement to generate 3 hard, venture-specific
                  questions. It will not invent facts or answer on your behalf.
                </p>

                <button
                  type="button"
                  onClick={handleGenerateQuestions}
                  disabled={loadingQuestions}
                  className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#0B162C] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingQuestions ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Reviewing Entered Strategy...</span>
                    </>
                  ) : (
                    <>
                      <Swords className="h-4 w-4" aria-hidden="true" />
                      <span>Challenge My Strategy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {/* Progress Bar & Challenge Step Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                    Challenge {activeIndex + 1} of {challenges.length}
                  </span>
                  <span className="text-xs text-slate-500">
                    {answeredWithFeedbackCount} / {challenges.length} defended
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {challenges.map((item, idx) => {
                    const isCurrent = idx === activeIndex;
                    const isAnswered = Boolean(item.feedback);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectChallengeIndex(idx)}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'border-[#0B162C] bg-[#0B162C] text-white'
                            : isAnswered
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/70'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isAnswered && (
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              isCurrent ? 'text-emerald-300' : 'text-emerald-700'
                            }`}
                            aria-hidden="true"
                          />
                        )}
                        <span className="font-mono tabular-nums">
                          Challenge {idx + 1} of {challenges.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Challenge Question + Defence + Feedback */}
              {currentChallenge && (
                <div className="px-6 py-6">
                  {/* Question Card */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Challenge {activeIndex + 1} of {challenges.length} ·{' '}
                        {currentChallenge.focusArea}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-base font-semibold leading-snug text-slate-900">
                      {currentChallenge.question}
                    </p>
                    {currentChallenge.contextBasis && (
                      <p className="mt-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          Grounded in your workspace:{' '}
                        </span>
                        {currentChallenge.contextBasis}
                      </p>
                    )}
                  </div>

                  {/* Step 3 — Defence Textarea & Submit */}
                  <div className="mt-5">
                    <label
                      htmlFor={`challenge-defence-${currentChallenge.id}`}
                      className="block text-xs font-semibold uppercase tracking-wide text-slate-700"
                    >
                      Your Strategic Defence
                    </label>
                    <textarea
                      id={`challenge-defence-${currentChallenge.id}`}
                      rows={4}
                      value={currentChallenge.userResponse}
                      onChange={(e) => handleResponseChange(e.target.value)}
                      placeholder="Write your evidence-based defence for this challenge..."
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {activeIndex > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectChallengeIndex(activeIndex - 1)
                            }
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <ChevronLeft
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Previous Challenge</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitDefence}
                        disabled={
                          loadingFeedback ||
                          !currentChallenge.userResponse.trim()
                        }
                        className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {loadingFeedback ? (
                          <>
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                            <span>Evaluating Defence...</span>
                          </>
                        ) : (
                          <span>
                            {currentChallenge.feedback
                              ? 'Resubmit My Defence'
                              : 'Submit My Defence'}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Step 4 — Gemini Structured Feedback */}
                  {currentChallenge.feedback && (
                    <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-semibold text-slate-900">
                          Gemini Challenger Feedback
                        </h3>
                        <span className="font-mono text-[11px] text-slate-500">
                          Based strictly on entered data
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4">
                          <h4 className="font-mono text-xs font-bold tracking-wide text-emerald-900">
                            SUPPORTED
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-slate-800">
                            {currentChallenge.feedback.supported}
                          </p>
                        </div>

                        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-4">
                          <h4 className="font-mono text-xs font-bold tracking-wide text-amber-900">
                            ASSUMPTION
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-slate-800">
                            {currentChallenge.feedback.assumption}
                          </p>
                        </div>

                        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                          <h4 className="font-mono text-xs font-bold tracking-wide text-slate-900">
                            NEXT EVIDENCE NEEDED
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-slate-800">
                            {currentChallenge.feedback.nextEvidenceNeeded}
                          </p>
                        </div>
                      </div>

                      {/* Step 5 — Next Challenge or Complete Final Review */}
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        {activeIndex < challenges.length - 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectChallengeIndex(activeIndex + 1)
                            }
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#0B162C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                          >
                            <span>Next Challenge</span>
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        ) : (
                          allThreeHaveFeedback && (
                            <button
                              type="button"
                              onClick={handleGenerateFinalReview}
                              disabled={loadingReview}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#0B162C] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                            >
                              {loadingReview ? (
                                <>
                                  <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden="true"
                                  />
                                  <span>Preparing Final Review...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {challengeData.review
                                      ? 'Refresh Final Strategy Review'
                                      : 'Complete Strategy Challenge'}
                                  </span>
                                </>
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6 — Final Strategy Review */}
              {challengeData.completed && challengeData.review && (
                <div className="bg-emerald-50/25 px-6 py-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-5 w-5 text-emerald-700"
                        aria-hidden="true"
                      />
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Strategy Challenge Complete
                      </h3>
                    </div>

                    <span className="text-xs font-semibold text-emerald-800">
                      Competition War Room unlocked in Section 07
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-md border border-emerald-200 bg-white p-4">
                      <h4 className="font-mono text-xs font-bold tracking-wide text-emerald-900">
                        STRONGEST PART OF MY STRATEGY
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-800">
                        {challengeData.review.strongestPart}
                      </p>
                    </div>

                    <div className="rounded-md border border-amber-200 bg-white p-4">
                      <h4 className="font-mono text-xs font-bold tracking-wide text-amber-900">
                        BIGGEST ASSUMPTION
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-800">
                        {challengeData.review.biggestAssumption}
                      </p>
                    </div>

                    <div className="rounded-md border border-slate-200 bg-white p-4">
                      <h4 className="font-mono text-xs font-bold tracking-wide text-slate-900">
                        NEXT VALIDATION PRIORITY
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-800">
                        {challengeData.review.nextValidationPriority}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
