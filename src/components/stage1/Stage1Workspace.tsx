import { isAlternativeCompleted } from '../../hooks/useVentureStudio';
import type {
  AIStrategyChallengeData,
  AlternativeRecord,
  PositioningStatementData,
  Stage1Data,
  Stage1SectionId,
  StrategicCoordinate,
  VentureProfile,
} from '../../types/venture';
import { AIStrategyChallengeSection } from './AIStrategyChallengeSection';
import { CompetitorAnalysisSection } from './CompetitorAnalysisSection';
import { LabProgressionSection } from './LabProgressionSection';
import { PositioningMatrixSection } from './PositioningMatrixSection';
import { PositioningStatementSection } from './PositioningStatementSection';
import { Stage1Header } from './Stage1Header';
import { StrategicPositioningSection } from './StrategicPositioningSection';
import { VentureProfileSection } from './VentureProfileSection';

interface Stage1WorkspaceProps {
  ventureProfile: VentureProfile;
  stage1: Stage1Data;
  viewMode: 'all' | Stage1SectionId;
  onChangeViewMode: (mode: 'all' | Stage1SectionId) => void;
  onBackToVentureBank: () => void;
  onRequestSwitchVenture: () => void;
  onSaveProfile: (profile: VentureProfile) => void;
  onAddBlankAlternative: () => void;
  onUpdateAlternative: (
    alt: AlternativeRecord,
    feedbackMessage?: string
  ) => void;
  onDeleteAlternative: (id: string) => void;
  onUpdateMessMindPosition: (
    pos: StrategicCoordinate,
    showFeedback?: boolean
  ) => void;
  onUpdateAlternativePosition: (
    id: string,
    pos: StrategicCoordinate,
    showFeedback?: boolean
  ) => void;
  onUpdatePositioningStatementDraft: (next: PositioningStatementData) => void;
  onSavePositioningStatement: (next: PositioningStatementData) => void;
  onUpdateAIStrategyChallenge: (
    next: AIStrategyChallengeData,
    feedbackMessage?: string
  ) => void;
  onToggleComplete: (complete: boolean) => void;
}

export function Stage1Workspace({
  ventureProfile,
  stage1,
  viewMode,
  onChangeViewMode,
  onBackToVentureBank,
  onRequestSwitchVenture,
  onSaveProfile,
  onAddBlankAlternative,
  onUpdateAlternative,
  onDeleteAlternative,
  onUpdateMessMindPosition,
  onUpdateAlternativePosition,
  onUpdatePositioningStatementDraft,
  onSavePositioningStatement,
  onUpdateAIStrategyChallenge,
  onToggleComplete,
}: Stage1WorkspaceProps) {
  const completedCount = stage1.alternatives.filter(
    isAlternativeCompleted
  ).length;

  const showSection = (id: Stage1SectionId) =>
    viewMode === 'all' || viewMode === id;

  return (
    <div className="space-y-6">
      <Stage1Header
        ventureName={ventureProfile.ventureName}
        geography={ventureProfile.geography}
        completedCount={completedCount}
        totalSlotsCount={stage1.alternatives.length}
        stage1Completed={stage1.completed}
        viewMode={viewMode}
        onChangeViewMode={onChangeViewMode}
        onBackToVentureBank={onBackToVentureBank}
        onRequestSwitchVenture={onRequestSwitchVenture}
      />

      {showSection('venture-profile') && (
        <VentureProfileSection
          profile={ventureProfile}
          onSave={onSaveProfile}
        />
      )}

      {showSection('competitor-analysis') && (
        <CompetitorAnalysisSection
          alternatives={stage1.alternatives}
          onAddBlank={onAddBlankAlternative}
          onUpdate={onUpdateAlternative}
          onDelete={onDeleteAlternative}
        />
      )}

      {showSection('competitor-matrix') && (
        <PositioningMatrixSection alternatives={stage1.alternatives} />
      )}

      {showSection('positioning-map') && (
        <StrategicPositioningSection
          messMindPosition={stage1.messMindPosition}
          alternatives={stage1.alternatives}
          onUpdateMessMindPosition={onUpdateMessMindPosition}
          onUpdateAlternativePosition={onUpdateAlternativePosition}
        />
      )}

      {showSection('positioning-statement') && (
        <PositioningStatementSection
          ventureProfile={ventureProfile}
          alternatives={stage1.alternatives}
          messMindPosition={stage1.messMindPosition}
          statement={stage1.positioningStatement}
          onUpdateDraft={onUpdatePositioningStatementDraft}
          onSaveStatement={onSavePositioningStatement}
        />
      )}

      {showSection('ai-strategy-challenge') && (
        <AIStrategyChallengeSection
          ventureProfile={ventureProfile}
          alternatives={stage1.alternatives}
          messMindPosition={stage1.messMindPosition}
          positioningStatement={stage1.positioningStatement}
          challengeData={stage1.aiStrategyChallenge}
          onUpdateChallenge={onUpdateAIStrategyChallenge}
        />
      )}

      {showSection('lab-progression') && (
        <LabProgressionSection
          completedAlternativesCount={completedCount}
          positioningStatementSaved={stage1.positioningStatement.saved}
          positioningStatementSavedAt={stage1.positioningStatement.savedAt}
          aiStrategyChallengeCompleted={stage1.aiStrategyChallenge.completed}
          aiStrategyChallengeCompletedAt={
            stage1.aiStrategyChallenge.completedAt
          }
          stage1Completed={stage1.completed}
          stage1CompletedAt={stage1.completedAt}
          onToggleStage1Complete={onToggleComplete}
        />
      )}
    </div>
  );
}
