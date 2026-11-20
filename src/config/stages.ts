import type {
  MatrixCriterionId,
  MatrixRatingScore,
  StageDefinition,
  Stage1SectionId,
} from '../types/venture';

export const VENTURE_STAGES: StageDefinition[] = [
  {
    id: 'stage-1',
    order: 1,
    title: 'Competition & Positioning',
    subtitle: 'Evidence-based competitor research, map, and positioning',
    mission:
      "Research actual market alternatives, map competitive placement, and craft an evidence-backed positioning statement for MessMind.",
    status: 'active',
    sections: [
      {
        id: 'venture-profile',
        number: '01',
        label: 'Venture Profile',
        shortLabel: 'Venture Profile',
      },
      {
        id: 'competitor-analysis',
        number: '02',
        label: 'Competitor Research Workspace',
        shortLabel: 'Competitor Research',
      },
      {
        id: 'competitor-matrix',
        number: '03',
        label: 'Competitor Matrix',
        shortLabel: 'Competitor Matrix',
      },
      {
        id: 'positioning-map',
        number: '04',
        label: 'Positioning Map',
        shortLabel: 'Positioning Map',
      },
      {
        id: 'positioning-statement',
        number: '05',
        label: 'Positioning Statement',
        shortLabel: 'Positioning Statement',
      },
      {
        id: 'ai-strategy-challenge',
        number: '06',
        label: 'AI Strategy Challenge',
        shortLabel: 'AI Challenge',
      },
      {
        id: 'lab-progression',
        number: '07',
        label: 'Lab Progression',
        shortLabel: 'Progression',
      },
    ],
  },
  {
    id: 'stage-2',
    order: 2,
    title: 'Revenue & Pricing',
    subtitle: 'B2B SaaS packaging, per-bed tiers, and contract structure',
    mission: 'Design institutional subscription tiers and pricing metrics.',
    status: 'coming_next',
  },
  {
    id: 'stage-3',
    order: 3,
    title: 'Market Size & Demand',
    subtitle: 'TAM/SAM/SOM sizing starting from Dehradun hostels',
    mission: 'Quantify addressable institutional hostel dining demand.',
    status: 'coming_next',
  },
  {
    id: 'stage-4',
    order: 4,
    title: 'Go-to-Market Strategy',
    subtitle: 'Campus pilot playbook and mess contractor onboarding',
    mission: 'Structure outreach, pilot criteria, and institutional adoption.',
    status: 'coming_next',
  },
  {
    id: 'stage-5',
    order: 5,
    title: 'Financial Planning & Unit Economics',
    subtitle: 'CAC, LTV, gross margin, and payback benchmarks',
    mission: 'Model sustainable SaaS economics and operating runway.',
    status: 'coming_next',
  },
  {
    id: 'stage-6',
    order: 6,
    title: 'Operations, Risk & Sustainability',
    subtitle: 'Kitchen workflow adoption, data quality, and waste impact',
    mission: 'Mitigate execution risks and track measurable food-waste impact.',
    status: 'coming_next',
  },
];

export const STAGE1_SECTION_IDS: Stage1SectionId[] = [
  'venture-profile',
  'competitor-analysis',
  'competitor-matrix',
  'positioning-map',
  'positioning-statement',
  'ai-strategy-challenge',
  'lab-progression',
];

export interface MatrixCriterionMeta {
  id: MatrixCriterionId;
  label: string;
  description: string;
}

export const MATRIX_CRITERIA: MatrixCriterionMeta[] = [
  {
    id: 'ai_demand_forecasting',
    label: 'AI-based demand forecasting',
    description:
      'Predictive modeling of meal headcount using attendance history, menus, and day-of-week patterns.',
  },
  {
    id: 'student_meal_response',
    label: 'Student meal-response collection',
    description:
      'Fast pre-meal opt-in / opt-out attendance capture from hostel residents.',
  },
  {
    id: 'historical_consumption',
    label: 'Historical consumption analysis',
    description:
      'Structured tracking of served vs. prepared quantities across meal cycles and academic terms.',
  },
  {
    id: 'recommended_prep_quantities',
    label: 'Recommended kitchen preparation quantities',
    description:
      'Actionable batch and ingredient quantity guidance tailored for mess supervisors.',
  },
  {
    id: 'food_waste_tracking',
    label: 'Food-waste tracking',
    description:
      'Measurement of leftover, plate waste, and overproduction trends by meal.',
  },
  {
    id: 'institutional_mess_mgmt',
    label: 'Institutional mess management',
    description:
      'Support for hostel rosters, contractor coordination, and multi-hall meal schedules.',
  },
  {
    id: 'reporting_analytics',
    label: 'Reporting and analytics',
    description:
      'Decision-ready cost, attendance variance, and waste summaries for administrators.',
  },
];

export const MATRIX_RATING_LABELS: Record<MatrixRatingScore, string> = {
  1: 'Not Available',
  2: 'Basic',
  3: 'Moderate',
  4: 'Strong',
  5: 'Advanced',
};
