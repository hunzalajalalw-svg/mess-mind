import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is missing. Please configure GEMINI_API_KEY in your deployment environment variables or Settings > Secrets.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function stripMarkdownJsonFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: number }).status;
  if (status === 429 || (typeof status === 'number' && status >= 500)) {
    return true;
  }
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  return (
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('unavailable')
  );
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isRetryableError(err)) {
        const delayMs = 600 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function formatHttpError(err: unknown): { status: number; message: string } {
  if (err && typeof err === 'object') {
    const status = (err as { status?: number }).status;
    const message =
      err instanceof Error ? err.message : 'Unexpected server error.';

    if (status === 400 || message.includes('API_KEY_INVALID')) {
      return {
        status: 400,
        message:
          'The Gemini API rejected the request or API key. Please verify GEMINI_API_KEY.',
      };
    }
    if (status === 403 || message.includes('PERMISSION_DENIED')) {
      return {
        status: 403,
        message:
          'Permission denied by Gemini API. Please check your GEMINI_API_KEY configuration.',
      };
    }
    if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
      return {
        status: 429,
        message:
          'Gemini API rate limit or quota reached. Please wait briefly and try again.',
      };
    }
    if (typeof status === 'number' && status >= 400 && status < 600) {
      return { status, message };
    }
    return { status: 500, message };
  }
  return { status: 500, message: 'Unexpected server error.' };
}

interface WorkspaceContextPayload {
  ventureProfile: Record<string, unknown>;
  alternatives: Array<Record<string, unknown>>;
  messMindPosition: { x: number; y: number } | null;
  positioningStatement: Record<string, unknown>;
}

function buildContextSummaryText(ctx: WorkspaceContextPayload): string {
  const namedAlternatives = Array.isArray(ctx.alternatives)
    ? ctx.alternatives.filter(
        (alt) => typeof alt.name === 'string' && alt.name.trim() !== ''
      )
    : [];

  return JSON.stringify(
    {
      ventureProfile: ctx.ventureProfile,
      competitorResearchAndMatrix: namedAlternatives.map((alt) => ({
        name: alt.name,
        type: alt.type || 'Not specified',
        approximatePrice: alt.approximatePrice || 'Not specified',
        mainOffer: alt.mainOffer || 'Not specified',
        strengths: alt.strengths || 'Not specified',
        weaknesses: alt.weaknesses || 'Not specified',
        evidenceSource: alt.evidenceSource || 'None entered',
        evidenceQuality: alt.evidenceQuality || 'Not classified',
        threatScore: alt.threatScore ?? 'Not scored',
        positioningMapCoordinates: alt.position ?? 'Not placed on map',
      })),
      messMindPositioningMapCoordinates:
        ctx.messMindPosition ?? 'Not placed on map',
      positioningStatement: {
        targetCustomer: ctx.positioningStatement?.targetCustomer ?? '',
        categorySolution: ctx.positioningStatement?.categorySolution ?? '',
        primaryBenefit: ctx.positioningStatement?.primaryBenefit ?? '',
        mainAlternativeId: ctx.positioningStatement?.mainAlternativeId ?? '',
        reasonToBelieve: ctx.positioningStatement?.reasonToBelieve ?? '',
        statementText: ctx.positioningStatement?.statementText ?? '',
        evaluations: ctx.positioningStatement?.evaluations ?? [],
      },
    },
    null,
    2
  );
}

const STRICT_CHALLENGER_RULES = `STRICT RULES FOR GEMINI:
1. Act ONLY as a rigorous, evidence-based strategy challenger.
2. Use ONLY the information explicitly present in the provided workspace JSON (Venture Profile, Competitor Research, Competitor Matrix, Evidence/Sources, Positioning Map, and Positioning Statement).
3. NEVER invent competitors, prices, customer behaviour, market data, survey results, statistics, external facts, evidence, or venture capabilities that were not entered.
4. NEVER assume that any college, university, hostel administration, or mess contractor has agreed to buy, pilot, or adopt the venture.
5. NEVER claim proven food-waste reduction, forecast accuracy, or cost savings without entered evidence.
6. NEVER automatically write or rewrite the founder's strategy answer as a perfect response. Challenge and improve the founder's thinking.`;

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/strategy-challenge/questions', async (req, res) => {
  try {
    const workspaceContext = req.body?.workspaceContext as
      | WorkspaceContextPayload
      | undefined;
    if (!workspaceContext || !workspaceContext.ventureProfile) {
      res.status(400).json({ error: 'Workspace context is required.' });
      return;
    }

    const ai = getAiClient();
    const contextJson = buildContextSummaryText(workspaceContext);

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze ONLY the entered venture workspace below and generate exactly 3 difficult, specific strategic challenge questions testing whether MessMind's competitive position is logically defensible and supported by evidence.\n\nWORKSPACE DATA:\n${contextJson}`,
        config: {
          systemInstruction: `${STRICT_CHALLENGER_RULES}

TASK: Generate exactly 3 difficult questions about this venture's competitive position.
- Every question MUST directly reference specific entries, alternatives, evidence gaps, map coordinates, or claims present in the provided workspace JSON.
- Do NOT ask generic entrepreneurship questions.
- Cover distinct strategic vulnerabilities such as: switching friction from current meal-planning workflows, meaningful differentiation vs. a specific entered alternative, evidence supporting the Reason to Believe, consistency between the positioning statement and map coordinates, incumbent software copying forecasting, underestimated substitutes (like manual registers/spreadsheets), decision-maker vs. end-user split (college management vs. hostel administration vs. mess contractor), or whether reducing food wastage drives institutional purchasing.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: {
                      type: Type.STRING,
                      description: 'Short identifier such as q1, q2, q3.',
                    },
                    focusArea: {
                      type: Type.STRING,
                      description:
                        'Concise 2-5 word label of the strategic tension being tested.',
                    },
                    question: {
                      type: Type.STRING,
                      description:
                        'One sharp, specific challenge question grounded strictly in the entered workspace data.',
                    },
                    contextBasis: {
                      type: Type.STRING,
                      description:
                        'Brief 1-sentence note pointing to the exact entered workspace item(s) this question challenges.',
                    },
                  },
                  required: ['id', 'focusArea', 'question', 'contextBasis'],
                },
              },
            },
            required: ['questions'],
          },
        },
      })
    );

    const rawText = stripMarkdownJsonFence(response.text ?? '');
    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }
    const parsed = JSON.parse(rawText) as {
      questions?: Array<{
        id: string;
        focusArea: string;
        question: string;
        contextBasis: string;
      }>;
    };

    const questions = Array.isArray(parsed.questions)
      ? parsed.questions.slice(0, 3)
      : [];
    if (questions.length < 3) {
      throw new Error('Expected 3 challenge questions from Gemini.');
    }

    res.json({ questions });
  } catch (err) {
    const formatted = formatHttpError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post('/api/strategy-challenge/feedback', async (req, res) => {
  try {
    const { workspaceContext, question, defense } = req.body as {
      workspaceContext?: WorkspaceContextPayload;
      question?: { focusArea?: string; question?: string };
      defense?: string;
    };

    if (!workspaceContext || !question?.question || !defense?.trim()) {
      res.status(400).json({
        error: 'Workspace context, question, and your defense are required.',
      });
      return;
    }

    const ai = getAiClient();
    const contextJson = buildContextSummaryText(workspaceContext);

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `WORKSPACE DATA:\n${contextJson}\n\nCHALLENGE QUESTION (${question.focusArea ?? 'Strategy'}):\n${question.question}\n\nFOUNDER'S DEFENCE:\n${defense.trim()}`,
        config: {
          systemInstruction: `${STRICT_CHALLENGER_RULES}

TASK: Evaluate the founder's defence concisely under three exact fields:
- supported: State ONLY what in the founder's response is supported by information or evidence already entered in the workspace JSON. If nothing in the response is backed by entered evidence, state that explicitly. Keep concise (2-3 sentences max).
- assumption: Identify any claim in the founder's response that is not sufficiently supported by the evidence already entered in the workspace JSON. Do not treat assumptions as facts. Keep concise (2-3 sentences max).
- nextEvidenceNeeded: State what specific additional evidence, observation, customer feedback, or market information would help test that assumption. Keep concise and actionable (2-3 sentences max).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              supported: { type: Type.STRING },
              assumption: { type: Type.STRING },
              nextEvidenceNeeded: { type: Type.STRING },
            },
            required: ['supported', 'assumption', 'nextEvidenceNeeded'],
          },
        },
      })
    );

    const rawText = stripMarkdownJsonFence(response.text ?? '');
    if (!rawText) {
      throw new Error('Gemini returned an empty feedback response.');
    }
    const parsed = JSON.parse(rawText) as {
      supported: string;
      assumption: string;
      nextEvidenceNeeded: string;
    };

    res.json({
      feedback: {
        supported: parsed.supported,
        assumption: parsed.assumption,
        nextEvidenceNeeded: parsed.nextEvidenceNeeded,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const formatted = formatHttpError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post('/api/strategy-challenge/review', async (req, res) => {
  try {
    const { workspaceContext, challenges } = req.body as {
      workspaceContext?: WorkspaceContextPayload;
      challenges?: Array<{
        focusArea: string;
        question: string;
        userResponse: string;
        feedback: {
          supported: string;
          assumption: string;
          nextEvidenceNeeded: string;
        } | null;
      }>;
    };

    if (
      !workspaceContext ||
      !Array.isArray(challenges) ||
      challenges.length < 3
    ) {
      res.status(400).json({
        error:
          'Workspace context and all 3 completed challenges are required.',
      });
      return;
    }

    const ai = getAiClient();
    const contextJson = buildContextSummaryText(workspaceContext);
    const exchangesJson = JSON.stringify(challenges, null, 2);

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: `WORKSPACE DATA:\n${contextJson}\n\nCOMPLETED 3-CHALLENGE EXCHANGES:\n${exchangesJson}`,
        config: {
          systemInstruction: `${STRICT_CHALLENGER_RULES}

TASK: Synthesize a concise Final Strategy Review after all 3 challenges are completed.
- Do NOT predict whether the venture will succeed or fail.
- Return three concise sections (2-3 sentences each):
  - strongestPart: ("STRONGEST PART OF MY STRATEGY") State what is strongest using ONLY information supported by the existing entered work and evidence.
  - biggestAssumption: ("BIGGEST ASSUMPTION") Identify the single most important unsupported or weakly supported assumption revealed across the workspace and challenge responses.
  - nextValidationPriority: ("NEXT VALIDATION PRIORITY") State the single most important thing the founder should test or research next, directly following from the entered information (such as willingness of colleges or mess operators to pay, actual student meal-response behaviour, availability and reliability of historical consumption data, practical usefulness of demand forecasts, or operational feasibility of implementing the system).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strongestPart: { type: Type.STRING },
              biggestAssumption: { type: Type.STRING },
              nextValidationPriority: { type: Type.STRING },
            },
            required: [
              'strongestPart',
              'biggestAssumption',
              'nextValidationPriority',
            ],
          },
        },
      })
    );

    const rawText = stripMarkdownJsonFence(response.text ?? '');
    if (!rawText) {
      throw new Error('Gemini returned an empty strategy review.');
    }
    const parsed = JSON.parse(rawText) as {
      strongestPart: string;
      biggestAssumption: string;
      nextValidationPriority: string;
    };

    res.json({
      review: {
        strongestPart: parsed.strongestPart,
        biggestAssumption: parsed.biggestAssumption,
        nextValidationPriority: parsed.nextValidationPriority,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const formatted = formatHttpError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

export default app;
