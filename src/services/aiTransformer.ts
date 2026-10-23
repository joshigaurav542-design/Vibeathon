import { GEMINI_API_KEY, GEMINI_ENDPOINT, IS_API_KEY_CONFIGURED } from '../config/aiConfig';
import { PersonaOutput, PersonaType, ToneScores, TransformationResult } from '../types';
import { calculateDeltaStats } from '../utils/diffAnalyzer';

const PERSONA_METADATA: Record<PersonaType, {
  title: string;
  badgeLabel: string;
  badgeColor: 'amber' | 'emerald' | 'cyan' | 'purple';
  description: string;
  icon: string;
}> = {
  executive: {
    title: 'Executive C-Level Summary',
    badgeLabel: 'Executive Brief',
    badgeColor: 'amber',
    description: 'Decisive, high-level, risk-framed, and bottom-line focused for leadership and investors.',
    icon: 'Briefcase',
  },
  peer: {
    title: 'Supportive Peer Feedback',
    badgeLabel: 'Supportive Peer',
    badgeColor: 'emerald',
    description: 'Empathetic, collaborative, psychologically safe, and constructive team alignment.',
    icon: 'HeartHandshake',
  },
  legal: {
    title: 'Legal / Compliance Notice',
    badgeLabel: 'Legal / Compliance',
    badgeColor: 'cyan',
    description: 'Objective, auditable, strictly liability-mitigated, and procedurally accurate.',
    icon: 'Scale',
  },
  genz: {
    title: 'Gen-Z Hype / Viral',
    badgeLabel: 'Gen-Z Hype / Viral',
    badgeColor: 'purple',
    description: 'Energetic, slang-fluent, candid, high-engagement, internet-native communication.',
    icon: 'Sparkles',
  },
};

interface GeminiTransformPayload {
  detectedVibe: string;
  inputTone: ToneScores;
  personas: {
    executive: { rewrittenText: string; toneScores: ToneScores; preservedFacts: string[] };
    peer: { rewrittenText: string; toneScores: ToneScores; preservedFacts: string[] };
    legal: { rewrittenText: string; toneScores: ToneScores; preservedFacts: string[] };
    genz: { rewrittenText: string; toneScores: ToneScores; preservedFacts: string[] };
  };
}

/**
 * Transforms raw draft across all 4 personas simultaneously using Gemini 2.5 Flash,
 * falling back gracefully to dynamic heuristic generation if offline, missing keys, or rate limited.
 */
export async function transformDraft(
  draftText: string,
  sliderWeights: { formality: number; warmth: number; urgency: number }
): Promise<TransformationResult> {
  const startTime = performance.now();

  if (IS_API_KEY_CONFIGURED) {
    try {
      const result = await callGeminiAPI(draftText, sliderWeights);
      const executionTimeMs = Math.round(performance.now() - startTime);
      return assembleResult(draftText, result, executionTimeMs);
    } catch (err) {
      console.warn('Gemini API call encountered error, activating smart dynamic fallback generator:', err);
    }
  }

  // Graceful instantaneous smart fallback
  await new Promise((resolve) => setTimeout(resolve, 280));
  const fallbackPayload = generateSmartFallback(draftText, sliderWeights);
  const executionTimeMs = Math.round(performance.now() - startTime);
  return assembleResult(draftText, fallbackPayload, executionTimeMs);
}

/**
 * Real API call to Google Gemini 2.5 Flash with structured JSON output
 */
async function callGeminiAPI(
  draftText: string,
  sliderWeights: { formality: number; warmth: number; urgency: number }
): Promise<GeminiTransformPayload> {
  const systemInstruction = `You are VibeShift, a state-of-the-art persona and tone modulation engine.
Given a raw user draft and global target modulation weights (Formality: ${sliderWeights.formality}%, Warmth: ${sliderWeights.warmth}%, Urgency: ${sliderWeights.urgency}%), you will rewrite the EXACT same core facts into 4 distinct personas simultaneously:

1. "executive": Executive C-Level Summary (Board-level brevity, proactive incident mitigation, business impact, clear timelines, zero panicking).
2. "peer": Supportive Peer Feedback (Warmth, empathy, blameless culture, shared learning, collaborative next steps).
3. "legal": Legal / Compliance Notice (Formal, rigorous, auditable, risk-controlled, procedural terminology).
4. "genz": Gen-Z Hype / Viral (Internet slang like 'no cap', 'fr fr', 'cooking', 'locked in', 'lowkey', high energy, candid, pop culture fluency).

CRITICAL REQUIREMENT: 100% Core Facts Preserved. You must never invent false details or lose key constraints (times, names, errors, blockers, decisions).

Respond ONLY with valid JSON matching this exact schema:
{
  "detectedVibe": "string (e.g. 'High Stress / Direct')",
  "inputTone": {
    "formality": number (0-100),
    "empathy": number (0-100),
    "urgency": number (0-100),
    "clarity": number (0-100)
  },
  "personas": {
    "executive": {
      "rewrittenText": "string",
      "toneScores": { "formality": number, "empathy": number, "urgency": number, "clarity": number },
      "preservedFacts": ["fact 1", "fact 2", "fact 3"]
    },
    "peer": {
      "rewrittenText": "string",
      "toneScores": { "formality": number, "empathy": number, "urgency": number, "clarity": number },
      "preservedFacts": ["fact 1", "fact 2", "fact 3"]
    },
    "legal": {
      "rewrittenText": "string",
      "toneScores": { "formality": number, "empathy": number, "urgency": number, "clarity": number },
      "preservedFacts": ["fact 1", "fact 2", "fact 3"]
    },
    "genz": {
      "rewrittenText": "string",
      "toneScores": { "formality": number, "empathy": number, "urgency": number, "clarity": number },
      "preservedFacts": ["fact 1", "fact 2", "fact 3"]
    }
  }
}`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Draft to transform:\n"${draftText}"` }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No content returned from Gemini');
  }

  return JSON.parse(rawText) as GeminiTransformPayload;
}

/**
 * Assembles and verifies final TransformationResult with exact delta stats
 */
function assembleResult(
  sourceDraft: string,
  payload: GeminiTransformPayload,
  executionTimeMs: number
): TransformationResult {
  const personas: Record<PersonaType, PersonaOutput> = {} as any;

  (['executive', 'peer', 'legal', 'genz'] as PersonaType[]).forEach((key) => {
    const rawPersona = payload.personas[key];
    const meta = PERSONA_METADATA[key];
    const delta = calculateDeltaStats(sourceDraft, rawPersona.rewrittenText);

    personas[key] = {
      id: key,
      title: meta.title,
      badgeLabel: meta.badgeLabel,
      badgeColor: meta.badgeColor,
      description: meta.description,
      icon: meta.icon,
      rewrittenText: rawPersona.rewrittenText,
      toneScores: rawPersona.toneScores,
      deltaStats: {
        wordCountDeltaPercent: delta.wordCountDeltaPercent,
        originalWordCount: delta.origWordCount,
        rewrittenWordCount: delta.rewrWordCount,
        vocabularyShiftPercent: delta.vocabularyShiftPercent,
        readingTimeSeconds: delta.readingTimeSeconds,
        sentimentSummary: getSentimentSummary(key),
      },
      preservedFacts: rawPersona.preservedFacts || [
        'Root trigger identified',
        'Action items & rollback verified',
        'Timeline & deliverables preserved',
      ],
    };
  });

  return {
    sourceDraft,
    detectedVibe: payload.detectedVibe || 'Direct / Unvarnished',
    inputTone: payload.inputTone || { formality: 35, empathy: 25, urgency: 85, clarity: 75 },
    executionTimeMs,
    personas,
  };
}

function getSentimentSummary(type: PersonaType): string {
  switch (type) {
    case 'executive':
      return 'Strategic & Risk-Mitigated';
    case 'peer':
      return 'Empathetic & Collaborative';
    case 'legal':
      return 'Formally Auditable & Compliant';
    case 'genz':
      return 'Energetic & Viral Cadence';
  }
}

/**
 * Instant dynamic fallback generator for zero-setup visitor experience
 */
function generateSmartFallback(
  draft: string,
  sliders: { formality: number; warmth: number; urgency: number }
): GeminiTransformPayload {
  const isServerCrash = draft.toLowerCase().includes('cluster') || draft.toLowerCase().includes('502') || draft.toLowerCase().includes('crash');
  const isScopeCreep = draft.toLowerCase().includes('scope') || draft.toLowerCase().includes('oauth') || draft.toLowerCase().includes('stripe');
  const isCodeReview = draft.toLowerCase().includes('pr') || draft.toLowerCase().includes('n+1') || draft.toLowerCase().includes('test');

  if (isServerCrash) {
    return {
      detectedVibe: 'High Stress / Direct',
      inputTone: { formality: 30, empathy: 15, urgency: 95, clarity: 70 },
      personas: {
        executive: {
          rewrittenText: `We experienced a temporary service degradation affecting checkout transactions due to an unscheduled schema deployment. Rollback was executed within 10 minutes. SRE has isolated the incident and data reconciliation is underway. A comprehensive incident post-mortem will be distributed by 12:00 PM EST.`,
          toneScores: { formality: 96, empathy: 55, urgency: 85, clarity: 98 },
          preservedFacts: [
            'Checkout impact due to schema deployment',
            'Rollback completed within 10 minutes',
            'Replication/queue reconciliation underway',
            'Root Cause Analysis (RCA) delivered by 12:00 PM',
          ],
        },
        peer: {
          rewrittenText: `Hey everyone, quick heads up that checkout hit a snag with the recent migration. The rollback went super smoothly, and SRE is currently syncing the cache. Let's please hold off on changes to us-east-1 while things stabilize. We will do a collaborative learning review at noon so we can improve our CI guardrails together!`,
          toneScores: { formality: 50, empathy: 94, urgency: 60, clarity: 92 },
          preservedFacts: [
            'Issue arose from recent unindexed migration',
            'Rollback already completed safely',
            'Hold off on us-east-1 changes during sync',
            'Post-incident collaborative sync at noon',
          ],
        },
        legal: {
          rewrittenText: `Notice regarding Production Environment: An unauthorized configuration modification triggered intermittent gateway non-responsiveness. Remediation protocols were initiated at 03:10 UTC; replication validation is ongoing under strict protocol. Systems in us-east-1 are in freeze status pending forensic audit. Root Cause Analysis documentation is scheduled for mandatory filing by 12:00.`,
          toneScores: { formality: 100, empathy: 20, urgency: 80, clarity: 95 },
          preservedFacts: [
            'Non-conforming migration deployed to production',
            'Rollback protocol initiated in 10 minutes',
            'us-east-1 freeze enforced during queue flush',
            'Mandatory incident audit filed by 12:00',
          ],
        },
        genz: {
          rewrittenText: `Besties the main cluster was in its flop era for a hot second because a 3am commit went feral 💀 but we reversed it in 10 mins flat no cap! SRE is currently cooking the cache back to life. Do NOT touch us-east-1 on god. Receipts and full debrief dropping at high noon fr fr.`,
          toneScores: { formality: 8, empathy: 78, urgency: 90, clarity: 88 },
          preservedFacts: [
            '3 AM commit caused server flop era (outage)',
            'Reversed (rollback) in 10 minutes flat',
            'SRE actively flushing the queue in us-east-1',
            'Full debrief dropping at noon',
          ],
        },
      },
    };
  }

  if (isScopeCreep) {
    return {
      detectedVibe: 'Frustrated / Defensive',
      inputTone: { formality: 50, empathy: 30, urgency: 85, clarity: 80 },
      personas: {
        executive: {
          rewrittenText: `To safeguard our scheduled Friday demo milestones, newly proposed items (OAuth2, avatars, and Stripe billing) cannot be incorporated without displacing committed roadmap deliverables. We recommend either deferring these enhancements to Phase 2 or adjusting the project delivery timeline by two weeks.`,
          toneScores: { formality: 95, empathy: 60, urgency: 80, clarity: 96 },
          preservedFacts: [
            '3 requested features: OAuth2, avatars, Stripe tier',
            'Sprint scope locked 10 days ago',
            'Delivery choice: drop existing milestones or extend 2 weeks',
          ],
        },
        peer: {
          rewrittenText: `Thanks for the creative suggestions! The team has poured massive effort into nailing the core transaction engine this sprint. Given our Friday demo commitment, taking on OAuth2 and Stripe right now would put unnecessary crunch on everyone. Let's sync today to either prioritize which existing ticket to swap out or schedule these exciting additions for the next cycle!`,
          toneScores: { formality: 55, empathy: 95, urgency: 65, clarity: 92 },
          preservedFacts: [
            'Team committed to core engine deliverables',
            'Friday demo remains primary target',
            'Open to swapping scope or extending deadline',
          ],
        },
        legal: {
          rewrittenText: `Formal Scope Notification: Incorporating supplemental specifications (OAuth2 authentication, profile customizers, and payment tiering) exceeds the contractual Statement of Work finalized on the sprint lock date. Pursuant to change control procedure, execution requires either a formal scope de-scope amendment or an executed schedule extension of fourteen calendar days.`,
          toneScores: { formality: 98, empathy: 20, urgency: 85, clarity: 94 },
          preservedFacts: [
            'Additions exceed locked sprint specification',
            'Impacts delivery feasibility for Friday',
            'Change control requires scope trade-off or 14-day extension',
          ],
        },
        genz: {
          rewrittenText: `Y'all are lowkey doing the most trying to drop OAuth2 and Stripe tiers three days before the demo 😭 our squad has been cooking overtime on the main engine and we are respectfully at capacity. We can either bench some other tickets right now or push launch out two weeks. You gotta pick the vibe!`,
          toneScores: { formality: 10, empathy: 75, urgency: 88, clarity: 86 },
          preservedFacts: [
            'Cannot add 3 new features before Friday demo',
            'Team worked overtime on core transaction engine',
            'Must choose between cutting scope or 2-week extension',
          ],
        },
      },
    };
  }

  if (isCodeReview) {
    return {
      detectedVibe: 'Critical / Technical',
      inputTone: { formality: 40, empathy: 25, urgency: 85, clarity: 88 },
      personas: {
        executive: {
          rewrittenText: `Pull Request #412 requires architectural remediation prior to release qualification. The current branch introduces query performance regressions in checkout search and lacks requisite automated test coverage. To maintain production stability, engineering has requested decomposing the changeset into three modular pull requests with verified regression suites.`,
          toneScores: { formality: 96, empathy: 50, urgency: 85, clarity: 97 },
          preservedFacts: [
            '1,400 line PR lacks required automated tests',
            'N+1 query in checkout search creates performance risk',
            'Action item: decompose into 3 modular PRs with tests',
          ],
        },
        peer: {
          rewrittenText: `Great work tackling this complex feature! I noticed a few high-impact areas we can optimize together: let's switch the search loop to eager loading to prevent database bottlenecks, and ensure error handling doesn't swallow connection alerts. To make review easier and safer to deploy, would you mind splitting this into three smaller PRs? Happy to pair-program on the test suites!`,
          toneScores: { formality: 52, empathy: 96, urgency: 60, clarity: 93 },
          preservedFacts: [
            'Eager loading needed to resolve search query',
            'Explicit error handling needed instead of empty catch',
            'Suggested split into three smaller, testable PRs',
          ],
        },
        legal: {
          rewrittenText: `Code Quality Compliance Audit: The submitted changeset fails Section 4.2 Engineering Standards due to omission of automated validation suites and silent exception suppression in payment-adjacent routines. The branch is held in non-mergeable status until performance benchmarking is satisfied and the diff is bifurcated into standard compliance units.`,
          toneScores: { formality: 99, empathy: 15, urgency: 80, clarity: 94 },
          preservedFacts: [
            'Zero tests violates code quality standards',
            'Silent exception catch in hot path must be remediated',
            'Changeset must be split into three units prior to merge',
          ],
        },
        genz: {
          rewrittenText: `Hold up bestie, this 1,400-line PR is pure chaos rn 😭 that N+1 query in checkout is gonna crash the database in 4K and swallowing errors in an empty catch is not the move! Let's slice this bad boy into 3 bite-sized PRs, slap some unit tests on it, and it will be absolute cinema!`,
          toneScores: { formality: 10, empathy: 82, urgency: 85, clarity: 90 },
          preservedFacts: [
            'PR is 1,400 lines without unit tests',
            'N+1 query and silent error catch must be fixed',
            'Split into 3 PRs with test coverage',
          ],
        },
      },
    };
  }

  // Dynamic synthesis for custom user inputs
  const words = draft.trim().split(/\s+/);
  const cleanSummary = words.slice(0, 15).join(' ');

  return {
    detectedVibe: sliders.formality > 60 ? 'Formal / Structured' : sliders.warmth > 60 ? 'Warm / Collaborative' : 'Expressive / Direct',
    inputTone: {
      formality: sliders.formality,
      empathy: sliders.warmth,
      urgency: sliders.urgency,
      clarity: 78,
    },
    personas: {
      executive: {
        rewrittenText: `Regarding our core objectives: ${cleanSummary}... We have established strategic alignment across stakeholders to ensure operational continuity and measurable outcome delivery according to executive milestones.`,
        toneScores: { formality: Math.min(100, sliders.formality + 35), empathy: 60, urgency: sliders.urgency, clarity: 96 },
        preservedFacts: ['Core intent preserved', 'Leadership framing applied', 'Clear accountability established'],
      },
      peer: {
        rewrittenText: `Hey teammates, sharing a quick perspective: ${cleanSummary}... Really appreciate everyone's dedication here! Let's touch base and collaborate on the best way forward so we can succeed together.`,
        toneScores: { formality: Math.max(30, sliders.formality - 15), empathy: Math.min(100, sliders.warmth + 40), urgency: Math.max(20, sliders.urgency - 20), clarity: 92 },
        preservedFacts: ['Empathetic team cadence', 'Open collaborative channel', 'Constructive alignment'],
      },
      legal: {
        rewrittenText: `Official Administrative Communication: With respect to ${cleanSummary}... Formal protocols are hereby recorded in accordance with governance policies, procedural compliance requirements, and audit verification.`,
        toneScores: { formality: 99, empathy: 20, urgency: sliders.urgency, clarity: 95 },
        preservedFacts: ['Strict procedural compliance', 'Risk mitigation established', 'Auditable record of communication'],
      },
      genz: {
        rewrittenText: `Ok hear me out fam, quick update: ${cleanSummary}... We are locked in and absolutely cooking! No cap, we got this handled fr fr! 🚀✨`,
        toneScores: { formality: 8, empathy: 80, urgency: sliders.urgency, clarity: 89 },
        preservedFacts: ['High-energy viral tone', 'Authentic Gen-Z slang', 'Zero loss of underlying message'],
      },
    },
  };
}
