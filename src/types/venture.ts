export type StageId =
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'stage-4'
  | 'stage-5'
  | 'stage-6';

export type StageStatus = 'active' | 'coming_next';

export type WorkspaceView = 'venture-bank' | 'competition-lab';

export type Stage1SectionId =
  | 'venture-profile'
  | 'competitor-analysis'
  | 'competitor-matrix'
  | 'positioning-map'
  | 'positioning-statement'
  | 'ai-strategy-challenge'
  | 'lab-progression';

export interface StageSectionMeta {
  id: Stage1SectionId;
  number: string;
  label: string;
  shortLabel: string;
}

export interface StageDefinition {
  id: StageId;
  order: number;
  title: string;
  subtitle: string;
  mission: string;
  status: StageStatus;
  sections?: StageSectionMeta[];
}

export interface VentureProfile {
  ventureName: string;
  businessCategory: string;
  targetCustomer: string;
  endUsers: string;
  problem: string;
  geography: string;
  offer: string;
  revenueModel: string;
}

export type EvidenceQuality = 'Strong' | 'Moderate' | 'Weak';

export type AlternativeType =
  | 'Direct Competitor'
  | 'Indirect Competitor'
  | 'Substitute'
  | 'Do Nothing';

export type MatrixCriterionId =
  | 'ai_demand_forecasting'
  | 'student_meal_response'
  | 'historical_consumption'
  | 'recommended_prep_quantities'
  | 'food_waste_tracking'
  | 'institutional_mess_mgmt'
  | 'reporting_analytics';

export type MatrixRatingScore = 1 | 2 | 3 | 4 | 5;
export type MatrixRatingValue = MatrixRatingScore | null;

export type MatrixRatingsMap = Record<MatrixCriterionId, MatrixRatingValue>;

export interface StrategicCoordinate {
  x: number;
  y: number;
}

export interface AlternativeRecord {
  id: string;
  name: string;
  type: AlternativeType | '';
  approximatePrice: string;
  mainOffer: string;
  strengths: string;
  weaknesses: string;
  evidenceSource: string;
  evidenceQuality: EvidenceQuality | '';
  threatScore: 1 | 2 | 3 | 4 | 5 | null;
  matrixRatings: MatrixRatingsMap;
  position: StrategicCoordinate | null;
}

export interface DifferentiationProfile {
  coreCustomerProblem: string;
  primaryDifferentiator: string;
  uniqueValueProposition: string;
  keyCompetitiveAdvantage: string;
  whyChooseMessMind: string;
  barriersToImitation: string;
  positioningStatement: string;
}

export type StatementEvaluationLevel = 'Strong' | 'Needs Improvement' | 'Weak';

export type StatementDimensionId =
  | 'target_customer_clarity'
  | 'primary_benefit_clarity'
  | 'differentiation'
  | 'evidence_reason_to_believe'
  | 'consistency_with_map';

export interface StatementDimensionEvaluation {
  id: StatementDimensionId;
  label: string;
  rating: StatementEvaluationLevel;
  explanation: string;
  needsEvidence?: boolean;
  assumptionFlag?: string | null;
}

export interface PositioningStatementData {
  targetCustomer: string;
  categorySolution: string;
  primaryBenefit: string;
  mainAlternativeId: string;
  reasonToBelieve: string;
  statementText: string;
  evaluations: StatementDimensionEvaluation[];
  saved: boolean;
  savedAt: string | null;
}

export interface StrategyChallengeFeedback {
  supported: string;
  assumption: string;
  nextEvidenceNeeded: string;
  generatedAt: string;
}

export interface StrategyChallengeItem {
  id: string;
  focusArea: string;
  question: string;
  contextBasis: string;
  userResponse: string;
  feedback: StrategyChallengeFeedback | null;
}

export interface StrategyChallengeReview {
  strongestPart: string;
  biggestAssumption: string;
  nextValidationPriority: string;
  generatedAt: string;
}

export interface AIStrategyChallengeData {
  challenges: StrategyChallengeItem[];
  currentIndex: number;
  review: StrategyChallengeReview | null;
  completed: boolean;
  completedAt: string | null;
  generatedAt: string | null;
}

export interface Stage1Data {
  alternatives: AlternativeRecord[];
  messMindMatrixRatings: MatrixRatingsMap;
  messMindPosition: StrategicCoordinate | null;
  differentiation: DifferentiationProfile;
  positioningStatement: PositioningStatementData;
  aiStrategyChallenge: AIStrategyChallengeData;
  criticalAssumption: string;
  completed: boolean;
  completedAt: string | null;
}

export interface VentureWorkspace {
  id: string;
  ventureProfile: VentureProfile;
  stage1: Stage1Data;
  futureStages: {
    'stage-2': Record<string, unknown> | null;
    'stage-3': Record<string, unknown> | null;
    'stage-4': Record<string, unknown> | null;
    'stage-5': Record<string, unknown> | null;
    'stage-6': Record<string, unknown> | null;
  };
}

export interface VentureStudioState {
  version: number;
  activeView: WorkspaceView;
  selectedStageId: StageId;
  selectedVentureId: string | null;
  ventures: VentureWorkspace[];
  lastSavedAt: string;
}
