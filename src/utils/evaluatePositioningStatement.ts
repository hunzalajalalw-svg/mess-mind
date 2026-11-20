import type {
  AlternativeRecord,
  PositioningStatementData,
  StatementDimensionEvaluation,
  StrategicCoordinate,
  VentureProfile,
} from '../types/venture';

// Outcome claims that require actual supporting evidence in the app rather than being asserted unverified
const UNVERIFIED_OUTCOME_PATTERNS: { pattern: RegExp; label: string }[] = [
  {
    pattern:
      /\b(reduc\w*\s+(food\s+)?wast\w*|eliminat\w*\s+(food\s+)?wast\w*|zero\s+waste|cut\w*\s+(food\s+)?wast\w*|less\s+waste)\b/i,
    label: 'food-waste reduction',
  },
  {
    pattern:
      /\b(cost\s+sav\w*|sav\w*\s+(money|cost|budget|expenses)|reduc\w*\s+cost\w*|lower\s+cost\w*|roi|increase\w*\s+profit)\b/i,
    label: 'cost savings',
  },
  {
    pattern:
      /\b(forecast\s+accuracy|accurate\s+forecast\w*|predict\w*\s+accura\w*|\d{1,3}\s*%\s*(accuracy|accurate|reduction|less|savings))\b/i,
    label: 'forecast accuracy or quantified improvement',
  },
  {
    pattern:
      /\b(customer\s+satisfaction|student\s+satisfaction|higher\s+satisfaction|happier\s+students|proven\s+results?)\b/i,
    label: 'customer satisfaction or proven outcomes',
  },
];

function detectUnverifiedClaims(text: string): string[] {
  const found: string[] = [];
  for (const item of UNVERIFIED_OUTCOME_PATTERNS) {
    if (item.pattern.test(text)) {
      found.push(item.label);
    }
  }
  return found;
}

function tokenizeKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
}

function hasOverlap(a: string, b: string): boolean {
  const wordsA = new Set(tokenizeKeywords(a));
  const wordsB = tokenizeKeywords(b);
  let matches = 0;
  for (const w of wordsB) {
    if (wordsA.has(w)) {
      matches += 1;
    }
  }
  return matches >= 2;
}

export function evaluatePositioningStatement(params: {
  statement: PositioningStatementData;
  ventureProfile: VentureProfile;
  alternatives: AlternativeRecord[];
  messMindPosition: StrategicCoordinate | null;
}): StatementDimensionEvaluation[] {
  const { statement, ventureProfile, alternatives, messMindPosition } = params;

  const target = statement.targetCustomer.trim();
  const category = statement.categorySolution.trim();
  const benefit = statement.primaryBenefit.trim();
  const reason = statement.reasonToBelieve.trim();

  const selectedAlternative =
    alternatives.find((a) => a.id === statement.mainAlternativeId) ?? null;

  const researchedAlternatives = alternatives.filter(
    (a) => a.name.trim() !== '' && a.evidenceSource.trim() !== ''
  );

  // 1. Target Customer Clarity
  let targetRating: StatementDimensionEvaluation['rating'] = 'Weak';
  let targetExplanation = '';
  if (!target) {
    targetRating = 'Weak';
    targetExplanation =
      'Target customer is empty. Specify the exact buyer or institutional segment from your Venture Profile.';
  } else if (
    target.split(/\s+/).length >= 4 &&
    /college|university|hostel|mess|institution|operator|admin/i.test(target)
  ) {
    targetRating = 'Strong';
    targetExplanation =
      'Clearly identifies a specific institutional buyer segment aligned with your Venture Profile.';
  } else {
    targetRating = 'Needs Improvement';
    targetExplanation =
      'Target customer is stated, but could name the specific decision-maker and institutional setting more precisely (e.g., private college hostels and mess operators).';
  }

  // 2. Primary Benefit Clarity
  const benefitUnverified = detectUnverifiedClaims(benefit);
  let benefitRating: StatementDimensionEvaluation['rating'] = 'Weak';
  let benefitExplanation = '';
  if (!benefit) {
    benefitRating = 'Weak';
    benefitExplanation =
      'Primary benefit is blank. State the main operational problem MessMind aims to address without claiming unproven results.';
  } else if (benefitUnverified.length > 0) {
    benefitRating = 'Needs Improvement';
    benefitExplanation = `Mentions unverified outcome claims (${benefitUnverified.join(', ')}). Frame this as an operational planning capability rather than a proven outcome unless supporting evidence is entered.`;
  } else if (benefit.split(/\s+/).length >= 5) {
    benefitRating = 'Strong';
    benefitExplanation =
      'States a clear, concrete operational benefit focused on meal-planning support without overclaiming unverified results.';
  } else {
    benefitRating = 'Needs Improvement';
    benefitExplanation =
      'Benefit is very brief. Clarify the specific operational improvement for hostel mess planning.';
  }

  // 3. Differentiation
  let diffRating: StatementDimensionEvaluation['rating'] = 'Weak';
  let diffExplanation = '';
  if (!selectedAlternative || !selectedAlternative.name.trim()) {
    diffRating = 'Weak';
    diffExplanation =
      'Select an alternative from your Competitor Matrix so differentiation is anchored against a real researched option.';
  } else if (!category || !reason) {
    diffRating = 'Needs Improvement';
    diffExplanation = `Alternative "${selectedAlternative.name}" is selected, but both Category/Solution and Reason to Believe are needed to show how MessMind differs.`;
  } else if (
    selectedAlternative.weaknesses.trim() &&
    (hasOverlap(reason, selectedAlternative.weaknesses) ||
      hasOverlap(benefit, selectedAlternative.weaknesses) ||
      reason.split(/\s+/).length >= 6)
  ) {
    diffRating = 'Strong';
    diffExplanation = `Contrasts MessMind directly against "${selectedAlternative.name}" using entered capability and limitation notes.`;
  } else {
    diffRating = 'Needs Improvement';
    diffExplanation = `Make the contrast with "${selectedAlternative.name}" more explicit by connecting your Reason to Believe to the specific weakness entered for that alternative in the Competitor Matrix.`;
  }

  // 4. Evidence / Reason to Believe (STRICT EVIDENCE RULE)
  const reasonUnverified = detectUnverifiedClaims(reason);
  const fullStatementUnverified = detectUnverifiedClaims(
    `${benefit} ${reason} ${statement.statementText}`
  );

  // Check if reason relates to actual entered Venture Profile offer/features or entered Competitor Research
  const appEvidenceCorpus = [
    ventureProfile.offer,
    ventureProfile.problem,
    ventureProfile.businessCategory,
    ...researchedAlternatives.map(
      (a) => `${a.name} ${a.weaknesses} ${a.mainOffer} ${a.evidenceSource}`
    ),
  ].join(' ');

  const supportedByAppFeatures =
    reason.length > 0 && hasOverlap(reason, appEvidenceCorpus);

  const hasStrongOrModerateResearch = researchedAlternatives.some(
    (a) => a.evidenceQuality === 'Strong' || a.evidenceQuality === 'Moderate'
  );

  let evidenceRating: StatementDimensionEvaluation['rating'] = 'Weak';
  let evidenceExplanation = '';
  let needsEvidence = false;
  let assumptionFlag: string | null = null;

  if (fullStatementUnverified.length > 0) {
    assumptionFlag = `Assumption: Claims regarding ${fullStatementUnverified.join(
      ', '
    )} are not backed by entered evidence in the app.`;
  }

  if (!reason) {
    evidenceRating = 'Weak';
    needsEvidence = true;
    evidenceExplanation =
      'NEEDS EVIDENCE — Reason to Believe is empty. Ground it in the proposed features in your Venture Profile and documented competitor gaps.';
  } else if (reasonUnverified.length > 0) {
    evidenceRating = 'Weak';
    needsEvidence = true;
    evidenceExplanation = `NEEDS EVIDENCE — Contains unsupported outcome claims (${reasonUnverified.join(
      ', '
    )}). Replace proven-result language with entered Venture Profile capabilities or add verified supporting evidence.`;
  } else if (!supportedByAppFeatures) {
    evidenceRating = 'Weak';
    needsEvidence = true;
    evidenceExplanation =
      'NEEDS EVIDENCE — Your Reason to Believe does not reference capabilities or competitor evidence already entered in the Venture Profile or Competitor Research.';
    if (!assumptionFlag) {
      assumptionFlag =
        'Assumption: Stated Reason to Believe is not directly traced to entered Venture Profile features or Competitor Matrix evidence.';
    }
  } else if (!hasStrongOrModerateResearch) {
    evidenceRating = 'Needs Improvement';
    needsEvidence = true;
    evidenceExplanation =
      'NEEDS EVIDENCE — References MessMind’s entered offer, but your Competitor Matrix does not yet include Strong or Moderate sourced evidence comparing alternatives.';
  } else {
    evidenceRating = 'Strong';
    needsEvidence = false;
    evidenceExplanation =
      'Reason to Believe aligns with MessMind’s entered offer and is supported by Strong/Moderate competitor research in your matrix.';
  }

  // 5. Consistency with the Positioning Map
  let mapRating: StatementDimensionEvaluation['rating'] = 'Weak';
  let mapExplanation = '';

  if (!messMindPosition) {
    mapRating = 'Needs Improvement';
    mapExplanation =
      'Place MessMind on the Positioning Map (Section 04) so map coordinates can be compared against your positioning statement.';
  } else if (!selectedAlternative) {
    mapRating = 'Needs Improvement';
    mapExplanation =
      'Select a Main Alternative from the Competitor Matrix to verify relative placement on the Positioning Map.';
  } else if (!selectedAlternative.position) {
    mapRating = 'Needs Improvement';
    mapExplanation = `Place "${selectedAlternative.name}" on the Positioning Map (Section 04) to verify consistency between map separation and your statement.`;
  } else {
    const deltaX = messMindPosition.x - selectedAlternative.position.x;
    const deltaY = messMindPosition.y - selectedAlternative.position.y;
    const hasClearSeparation = deltaX >= 10 || deltaY >= 10;

    if (hasClearSeparation) {
      mapRating = 'Strong';
      mapExplanation = `Consistent with the Positioning Map: MessMind (${messMindPosition.x}, ${messMindPosition.y}) sits ahead of "${selectedAlternative.name}" (${selectedAlternative.position.x}, ${selectedAlternative.position.y}) on Digitalization and/or Predictive Intelligence.`;
    } else {
      mapRating = 'Needs Improvement';
      mapExplanation = `On the Positioning Map, MessMind (${messMindPosition.x}, ${messMindPosition.y}) is not clearly separated above "${selectedAlternative.name}" (${selectedAlternative.position.x}, ${selectedAlternative.position.y}). Review either your map placement or claimed differentiation.`;
    }
  }

  return [
    {
      id: 'target_customer_clarity',
      label: 'Target Customer Clarity',
      rating: targetRating,
      explanation: targetExplanation,
    },
    {
      id: 'primary_benefit_clarity',
      label: 'Primary Benefit Clarity',
      rating: benefitRating,
      explanation: benefitExplanation,
      assumptionFlag: benefitUnverified.length > 0 ? assumptionFlag : null,
    },
    {
      id: 'differentiation',
      label: 'Differentiation',
      rating: diffRating,
      explanation: diffExplanation,
    },
    {
      id: 'evidence_reason_to_believe',
      label: 'Evidence / Reason to Believe',
      rating: evidenceRating,
      explanation: evidenceExplanation,
      needsEvidence,
      assumptionFlag,
    },
    {
      id: 'consistency_with_map',
      label: 'Consistency with the Positioning Map',
      rating: mapRating,
      explanation: mapExplanation,
    },
  ];
}
