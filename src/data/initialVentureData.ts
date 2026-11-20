import type {
  AIStrategyChallengeData,
  AlternativeRecord,
  AlternativeType,
  DifferentiationProfile,
  EvidenceQuality,
  MatrixRatingsMap,
  PositioningStatementData,
  Stage1Data,
  VentureProfile,
  VentureStudioState,
  VentureWorkspace,
} from '../types/venture';

export const MAX_ALTERNATIVES = 6;
export const MIN_COMPLETED_FOR_POSITIONING_MAP = 3;

export const ALTERNATIVE_TYPES: AlternativeType[] = [
  'Direct Competitor',
  'Indirect Competitor',
  'Substitute',
  'Do Nothing',
];

export const EVIDENCE_QUALITY_GUIDE: {
  value: EvidenceQuality;
  label: string;
  explanation: string;
}[] = [
  {
    value: 'Strong',
    label: 'Strong',
    explanation: 'Directly supported by a reliable, current source.',
  },
  {
    value: 'Moderate',
    label: 'Moderate',
    explanation: 'Supported, but evidence is indirect or incomplete.',
  },
  {
    value: 'Weak',
    label: 'Weak',
    explanation:
      'Assumption, informal observation or evidence that still needs validation.',
  },
];

export const INITIAL_VENTURE_PROFILE: VentureProfile = {
  ventureName: 'MessMind',
  businessCategory: 'AI-powered SaaS / Food-Tech',
  targetCustomer:
    'Private colleges, universities, hostel administrations and institutional mess operators',
  endUsers: 'Students, mess managers and kitchen supervisors',
  problem:
    'Unpredictable meal attendance can cause inaccurate food preparation, avoidable wastage, unnecessary costs and inefficient kitchen planning.',
  geography: 'Dehradun, Uttarakhand, India',
  offer:
    'A proposed platform combining student meal responses, historical consumption and demand forecasting to support mess planning.',
  revenueModel: 'B2B SaaS subscription.',
};

export function createEmptyMatrixRatings(): MatrixRatingsMap {
  return {
    ai_demand_forecasting: null,
    student_meal_response: null,
    historical_consumption: null,
    recommended_prep_quantities: null,
    food_waste_tracking: null,
    institutional_mess_mgmt: null,
    reporting_analytics: null,
  };
}

export function createEmptyDifferentiation(): DifferentiationProfile {
  return {
    coreCustomerProblem: '',
    primaryDifferentiator: '',
    uniqueValueProposition: '',
    keyCompetitiveAdvantage: '',
    whyChooseMessMind: '',
    barriersToImitation: '',
    positioningStatement: '',
  };
}

export function formatPositioningStatement(parts: {
  targetCustomer: string;
  categorySolution: string;
  primaryBenefit: string;
  mainAlternativeName: string;
  reasonToBelieve: string;
}): string {
  const target = parts.targetCustomer.trim() || '[Target Customer]';
  const category =
    parts.categorySolution.trim() || '[Category / Type of Solution]';
  const benefit = parts.primaryBenefit.trim() || '[Primary Benefit]';
  const alternative =
    parts.mainAlternativeName.trim() || '[Main Alternative]';
  const reason = parts.reasonToBelieve.trim() || '[Reason to Believe]';

  return `For ${target}, MessMind is a ${category} that provides ${benefit}, unlike ${alternative}, because ${reason}.`;
}

export function createInitialPositioningStatement(
  targetCustomer = INITIAL_VENTURE_PROFILE.targetCustomer
): PositioningStatementData {
  return {
    targetCustomer,
    categorySolution: '',
    primaryBenefit: '',
    mainAlternativeId: '',
    reasonToBelieve: '',
    statementText: formatPositioningStatement({
      targetCustomer,
      categorySolution: '',
      primaryBenefit: '',
      mainAlternativeName: '',
      reasonToBelieve: '',
    }),
    evaluations: [],
    saved: false,
    savedAt: null,
  };
}

export function createInitialAIStrategyChallenge(): AIStrategyChallengeData {
  return {
    challenges: [],
    currentIndex: 0,
    review: null,
    completed: false,
    completedAt: null,
    generatedAt: null,
  };
}

export function createBlankAlternative(idSuffix?: string): AlternativeRecord {
  const unique =
    idSuffix ?? `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: `alt-${unique}`,
    name: '',
    type: '',
    approximatePrice: '',
    mainOffer: '',
    strengths: '',
    weaknesses: '',
    evidenceSource: '',
    evidenceQuality: '',
    threatScore: null,
    matrixRatings: createEmptyMatrixRatings(),
    position: null,
  };
}

export function createInitialBlankAlternatives(): AlternativeRecord[] {
  return [
    createBlankAlternative('slot-1'),
    createBlankAlternative('slot-2'),
    createBlankAlternative('slot-3'),
  ];
}

export function createInitialStage1Data(
  targetCustomer = INITIAL_VENTURE_PROFILE.targetCustomer
): Stage1Data {
  return {
    alternatives: createInitialBlankAlternatives(),
    messMindMatrixRatings: createEmptyMatrixRatings(),
    messMindPosition: null,
    differentiation: createEmptyDifferentiation(),
    positioningStatement: createInitialPositioningStatement(targetCustomer),
    aiStrategyChallenge: createInitialAIStrategyChallenge(),
    criticalAssumption: '',
    completed: false,
    completedAt: null,
  };
}

export function createInitialMessMindWorkspace(): VentureWorkspace {
  return {
    id: 'messmind',
    ventureProfile: { ...INITIAL_VENTURE_PROFILE },
    stage1: createInitialStage1Data(INITIAL_VENTURE_PROFILE.targetCustomer),
    futureStages: {
      'stage-2': null,
      'stage-3': null,
      'stage-4': null,
      'stage-5': null,
      'stage-6': null,
    },
  };
}

export function createInitialStudioState(): VentureStudioState {
  return {
    version: 6,
    activeView: 'venture-bank',
    selectedStageId: 'stage-1',
    selectedVentureId: 'messmind',
    ventures: [createInitialMessMindWorkspace()],
    lastSavedAt: new Date().toISOString(),
  };
}
