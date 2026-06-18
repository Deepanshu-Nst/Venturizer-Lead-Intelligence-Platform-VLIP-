import Groq from "groq-sdk";
import { config } from "../../../config/index.js";
import { detectSubmissionVersion, normalizeAnswersForScoring } from "./version-detector.js";

// Initialize Groq client
// Use default key or empty string if not provided in env, groq-sdk will throw if empty when calling
const groq = new Groq({
  apiKey: config.groq.apiKey || "gsk_dummy",
});

export interface AiEvaluation {
  problem_clarity: number;
  market_understanding: number;
  differentiation: number;
  founder_conviction: number;
  execution_confidence: number;
  venture_potential: number;
  summary: string;
  strengths: string[];
  risks: string[];
  key_signals: string[];
  recommendation: string;
}

export async function evaluateLeadWithAI(
  type: "founder" | "investor",
  answers: Record<string, unknown>
): Promise<AiEvaluation | null> {
  if (!config.groq.apiKey || config.groq.apiKey === "gsk_examplekey" || config.groq.apiKey === "gsk_dummy") {
    console.warn("GROQ_API_KEY is not set or is a placeholder. Skipping AI evaluation.");
    return null;
  }

  const version = detectSubmissionVersion(answers);
  const normalizedAnswers = normalizeAnswersForScoring(answers, version);

  // Sanitize answers for the prompt
  const answerPairs = Object.entries(normalizedAnswers)
    .filter(([k]) => k !== "pitch_deck" && k !== "investment_thesis")
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
    .join("\n");

  const isFounder = type === "founder";
  const stageOrPersona = isFounder 
    ? (normalizedAnswers.mvp_status ?? "founder") 
    : (normalizedAnswers.investor_type ?? "investor");
  
  const systemPrompt = `You are a Partner at Sequoia Capital.
You evaluate early-stage startup applications and investor profiles.
Evaluate the following ${stageOrPersona} (${type}) application based on their answers.
The submission version is ${version}.

Your job is NOT to be impressed by polished writing.
You must prioritize evidence over storytelling.
Revenue > Vision
Users > Buzzwords
Validation > Hype

Scoring Guidelines:
Problem Clarity (0-10)
DO NOT PENALIZE CONCISE ANSWERS. A 10-word answer is perfect if it defines a clear B2B pain point.
0-3 = vague buzzwords
4-6 = understandable problem
7-8 = specific pain point
9-10 = urgent, expensive, proven problem

Market Understanding (0-10)
0-3 = generic customer
4-6 = defined segment
7-8 = strong ICP understanding
9-10 = deep market insight (or proven by revenue)

Differentiation (0-10)
0-3 = commodity solution
4-6 = some differentiation
7-8 = meaningful moat
9-10 = difficult-to-replicate advantage

Founder Conviction (0-10)
0-3 = weak commitment
4-6 = moderate commitment
7-8 = strong commitment
9-10 = obsessive founder behavior

Execution Confidence (0-10)
Prioritize: revenue, growth, users, and MVP maturity over writing.
If a company has $10k+ MRR or 1000+ users, their execution is undeniably proven. Score them 9+.

Venture Potential (0-10)
Can this become a venture-scale business? For investors, do they have the capital and network to back venture-scale businesses?

FOR INVESTORS:
Map your evaluation to the same 6 dimensions:
- Problem Clarity = Thesis Quality (How clearly do they understand the venture asset class?)
- Market Understanding = Sector Expertise (Do they know the markets they invest in?)
- Differentiation = Value Add (Why should a founder take their money over someone else's?)
- Founder Conviction = Deployment Reliability (How actively and decisively do they invest?)
- Execution Confidence = Portfolio Construction (Do they have a coherent strategy?)
- Venture Potential = Strategic Fit (Are they a good fit for top-tier founders?)

IMPORTANT:
Revenue and user traction matter more than eloquent writing.
A profitable boring startup should score higher than a beautifully written startup with no traction.
For investors, clarity of thesis and value-add is more important than the length of their answers.
DO NOT punish concise answers. A short, clear answer can still be strong.
If a stage or persona inherently does not have certain data (e.g. an idea-stage founder has no revenue, or an investor doesn't answer a non-applicable question), DO NOT penalize them. Evaluate based ONLY on the signal they did provide.

Provide a brutally honest, accurate, and structured JSON evaluation.

Return ONLY a valid JSON object with the following schema:
{
  "problem_clarity": <score 0-10>,
  "market_understanding": <score 0-10>,
  "differentiation": <score 0-10>,
  "founder_conviction": <score 0-10>,
  "execution_confidence": <score 0-10>,
  "venture_potential": <score 0-10>,
  "summary": "<2-3 sentence executive summary of the lead>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "risks": ["<risk 1>", "<risk 2>"],
  "key_signals": ["<key signal 1>", "<key signal 2>"],
  "recommendation": "<short recommendation, e.g., 'Schedule Intro Call' or 'Pass'>"
}
`;

  const userPrompt = `Here is the ${type} application:
${answerPairs}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as AiEvaluation;
    return parsed;
  } catch (error) {
    console.error("[ai-analyst] Groq evaluation failed:", error);
    return null;
  }
}

export function calculateAiScore(
  evalData: Record<string, any>,
  _type: "founder" | "investor",
  _answers: Record<string, unknown>
): number {
  // Extract all number values from the evaluation (which will be the 6 scores)
  // Ignore any non-number values (like arrays or strings)
  const scores = Object.values(evalData).filter(v => typeof v === 'number');
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, val) => acc + val, 0);
  
  // We expect 6 scores out of 10. If there are fewer/more, average them proportionally.
  const maxPossible = scores.length * 10;
  let aiScore = Math.round((sum / maxPossible) * 100);

  return aiScore;
}
