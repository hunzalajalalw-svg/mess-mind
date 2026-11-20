import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ConfirmModal } from './components/common/ConfirmModal';
import { JourneyStagesBar } from './components/layout/JourneyStagesBar';
import { TopBar } from './components/layout/TopBar';
import { Stage1Workspace } from './components/stage1/Stage1Workspace';
import { SwitchVentureModal } from './components/venture-bank/SwitchVentureModal';
import { VentureBankView } from './components/venture-bank/VentureBankView';
import { useAuth } from './context/AuthContext';
import {
  hasVentureResearch,
  useVentureStudio,
} from './hooks/useVentureStudio';
import type { Stage1SectionId } from './types/venture';

export default function App() {
  const {
    user,
    authReady,
    signingIn,
    authError,
    clearAuthError,
    signInWithGoogle,
    signOutUser,
  } = useAuth();

  const {
    state,
    selectedVenture,
    saveFeedback,
    cloudSynced,
    selectVenture,
    setActiveView,
    saveVentureProfile,
    addBlankAlternative,
    updateAlternative,
    deleteAlternative,
    updateMessMindPosition,
    updateAlternativePosition,
    updatePositioningStatementDraft,
    savePositioningStatement,
    updateAIStrategyChallenge,
    toggleStage1Completion,
    resetStudio,
  } = useVentureStudio();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [switchConfirmAction, setSwitchConfirmAction] = useState<
    | { type: 'select-venture'; targetVentureId: string }
    | { type: 'open-switcher' }
    | null
  >(null);
  const [viewMode, setViewMode] = useState<'all' | Stage1SectionId>('all');

  const handleRequestSelectVenture = (targetVentureId: string) => {
    if (selectedVenture && selectedVenture.id === targetVentureId) {
      selectVenture(targetVentureId);
      setSwitchModalOpen(false);
      return;
    }

    if (selectedVenture && hasVentureResearch(selectedVenture)) {
      setSwitchConfirmAction({
        type: 'select-venture',
        targetVentureId,
      });
      setSwitchModalOpen(false);
      return;
    }

    selectVenture(targetVentureId);
    setSwitchModalOpen(false);
  };

  const handleRequestSwitchFromLab = () => {
    setSwitchConfirmAction({ type: 'open-switcher' });
  };

  const handleConfirmSwitch = () => {
    if (!switchConfirmAction) return;

    if (switchConfirmAction.type === 'select-venture') {
      selectVenture(switchConfirmAction.targetVentureId);
      setSwitchConfirmAction(null);
      return;
    }

    setSwitchConfirmAction(null);
    if (state.ventures.length > 1) {
      setSwitchModalOpen(true);
    } else {
      setActiveView('venture-bank');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stage1Completed = selectedVenture?.stage1.completed ?? false;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Main Studio Header (Shown Once) */}
      <TopBar
        activeView={state.activeView}
        hasSelectedVenture={Boolean(selectedVenture)}
        lastSavedAt={state.lastSavedAt}
        saveFeedback={saveFeedback}
        cloudSynced={cloudSynced}
        user={user}
        authReady={authReady}
        signingIn={signingIn}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        onChangeView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestReset={() => setResetModalOpen(true)}
      />

      {/* Journey Stages Progression Strip (Shown Once at Top) */}
      <JourneyStagesBar
        stage1Completed={stage1Completed}
        activeView={state.activeView}
        hasSelectedVenture={Boolean(selectedVenture)}
        onOpenStage1={() => {
          if (selectedVenture) {
            setActiveView('competition-lab');
          }
        }}
      />

      {authError && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-900 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle
                className="h-4 w-4 shrink-0 text-rose-700"
                aria-hidden="true"
              />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              aria-label="Dismiss authentication message"
              className="rounded p-0.5 text-rose-700 hover:bg-rose-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {state.activeView === 'venture-bank' || !selectedVenture ? (
          <VentureBankView
            ventures={state.ventures}
            selectedVenture={selectedVenture}
            onSelectVenture={handleRequestSelectVenture}
            onContinueToLab={() => {
              setActiveView('competition-lab');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSwitchVenture={() => setSwitchModalOpen(true)}
          />
        ) : (
          <Stage1Workspace
            ventureProfile={selectedVenture.ventureProfile}
            stage1={selectedVenture.stage1}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onBackToVentureBank={() => {
              setActiveView('venture-bank');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRequestSwitchVenture={handleRequestSwitchFromLab}
            onSaveProfile={saveVentureProfile}
            onAddBlankAlternative={addBlankAlternative}
            onUpdateAlternative={updateAlternative}
            onDeleteAlternative={deleteAlternative}
            onUpdateMessMindPosition={updateMessMindPosition}
            onUpdateAlternativePosition={updateAlternativePosition}
            onUpdatePositioningStatementDraft={updatePositioningStatementDraft}
            onSavePositioningStatement={savePositioningStatement}
            onUpdateAIStrategyChallenge={updateAIStrategyChallenge}
            onToggleComplete={toggleStage1Completion}
          />
        )}
      </main>

      {/* Switch Venture Selection Modal (when multiple ventures exist) */}
      <SwitchVentureModal
        isOpen={switchModalOpen}
        ventures={state.ventures}
        selectedVentureId={selectedVenture?.id ?? null}
        onSelect={handleRequestSelectVenture}
        onClose={() => setSwitchModalOpen(false)}
      />

      {/* Exact Confirmation Prompt Before Switching Venture */}
      <ConfirmModal
        isOpen={Boolean(switchConfirmAction)}
        title="Switch Venture"
        description="Changing venture may make the existing competitor research irrelevant. Continue?"
        confirmLabel="Continue"
        variant="primary"
        onCancel={() => setSwitchConfirmAction(null)}
        onConfirm={handleConfirmSwitch}
      />

      {/* Reset Workspace Confirmation */}
      <ConfirmModal
        isOpen={resetModalOpen}
        title="Reset MessMind Venture Studio?"
        description="This will restore the Venture Profile to MessMind defaults and reset the Competition Lab to three blank alternative records."
        confirmLabel="Reset Workspace"
        variant="danger"
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetStudio();
          setResetModalOpen(false);
          setViewMode('all');
        }}
      />
    </div>
  );
}
