// ─────────────────────────────────────────────────────────────────────────────
// Deterministic scoring engine (PRD §5.3).
//
// This is the source of truth for all numbers. It runs fully client-side with
// no external dependency, so the product is operational with or without the AI
// layer. The AI layer (lib/ai.js) narrates and enriches these results; it never
// invents the scores.
// ─────────────────────────────────────────────────────────────────────────────

import { SECTORS, EQUITY_THRESHOLD, tierFor } from '../data/sectors.js';
import { peerReference, percentile, ordinal } from '../data/benchmarks.js';

// Is an adaptive follow-up currently active given the answers so far?
export function isActive(question, answers) {
  if (!question.dependsOn) return true;
  const parent = answers[question.dependsOn.id];
  if (parent == null) return false;
  return parent <= question.dependsOn.whenAtMost;
}

// Visible, scored questions for one sector given current answers.
export function activeScoredQuestions(sector, answers) {
  return sector.questions.filter((q) => q.scored !== false && isActive(q, answers));
}

function sectorScore(sector, answers) {
  const qs = activeScoredQuestions(sector, answers);
  let sum = 0;
  let wsum = 0;
  let answered = 0;
  for (const q of qs) {
    const v = answers[q.id];
    if (v == null) continue;
    const w = q.w ?? 1;
    sum += v * w;
    wsum += w;
    answered += 1;
  }
  const score = wsum > 0 ? Math.round((sum / wsum) * 100) : 0;
  return { score, answered, total: qs.length };
}

// Per-question contribution, used to rank strengths and gaps.
function questionContributions(sector, answers) {
  return activeScoredQuestions(sector, answers)
    .filter((q) => answers[q.id] != null)
    .map((q) => ({
      id: q.id,
      indicator: q.indicator,
      prompt: q.prompt,
      sectorId: sector.id,
      sectorName: sector.name,
      value: answers[q.id],
      score: Math.round(answers[q.id] * 100),
    }));
}

export function computeResults(answers, context = {}) {
  const sectors = SECTORS.map((s) => {
    const { score, answered, total } = sectorScore(s, answers);
    const contribs = questionContributions(s, answers);
    const sorted = [...contribs].sort((a, b) => b.score - a.score);
    return {
      id: s.id,
      name: s.name,
      icon: s.icon,
      focus: s.focus,
      weight: s.weight,
      score,
      answered,
      total,
      tier: tierFor(score),
      strengths: sorted.slice(0, 3),
      gaps: [...sorted].reverse().slice(0, 3),
      contribs,
    };
  });

  // Overall weighted readiness index.
  const overall = Math.round(sectors.reduce((acc, s) => acc + s.score * s.weight, 0));
  const overallTier = tierFor(overall);

  // Benchmarking vs peer reference.
  const ref = peerReference(context.communityType, context.populationBracket);
  const overallPct = percentile(overall, ref.overall, ref.spread);
  const benchmarks = sectors.map((s) => ({
    id: s.id,
    name: s.name,
    score: s.score,
    peer: Math.round(ref[s.id] ?? ref.overall),
    delta: s.score - Math.round(ref[s.id] ?? ref.overall),
  }));

  // Critical gaps — lowest-scoring active indicators across all sectors,
  // weighted so a weak high-weight sector ranks higher (PRD §5.3 gap ID).
  const allContribs = sectors.flatMap((s) =>
    s.contribs.map((c) => ({ ...c, sectorWeight: s.weight }))
  );
  const criticalGaps = [...allContribs]
    .sort((a, b) => a.score - b.score || b.sectorWeight - a.sectorWeight)
    .slice(0, 3);

  // Quick wins — weak indicators with the highest leverage (headroom × sector
  // capability × weight): one fix that lifts the visible average fastest.
  const quickWins = [...allContribs]
    .map((c) => {
      const sec = sectors.find((s) => s.id === c.sectorId);
      const headroom = 100 - c.score;
      const leverage = headroom * (sec.score / 100 + 0.4) * c.sectorWeight;
      return { ...c, leverage };
    })
    .filter((c) => c.score < 70)
    .sort((a, b) => b.leverage - a.leverage)
    .slice(0, 3);

  // Equity flags — any sector below the equity threshold (AC-13).
  const equityFlags = sectors
    .filter((s) => s.score < EQUITY_THRESHOLD)
    .map((s) => ({
      sectorId: s.id,
      sectorName: s.name,
      score: s.score,
      message: `${s.name} scores ${s.score}/100, below the equity threshold of ${EQUITY_THRESHOLD}. Residents risk exclusion as AI adoption accelerates.`,
    }));

  // Structural risk flags surfaced from specific indicator patterns.
  const riskFlags = buildRiskFlags(answers);

  return {
    generatedAt: new Date().toISOString(),
    context,
    overall,
    overallTier,
    overallPct,
    overallPctLabel: ordinal(overallPct),
    sectors,
    benchmarks,
    peerRef: ref,
    criticalGaps,
    quickWins,
    equityFlags,
    riskFlags,
  };
}

function buildRiskFlags(answers) {
  const flags = [];
  const lt = (id, t) => answers[id] != null && answers[id] <= t;

  if (lt('inf_affordability', 0.25) || lt('inf_broadband', 0.4)) {
    flags.push({
      type: 'Digital divide',
      severity: 'high',
      message:
        'Low broadband penetration or affordability will exclude lower-income residents from every downstream AI benefit. Treat connectivity as a precondition, not a parallel track.',
    });
  }
  if (lt('edu_equity_access', 0.25)) {
    flags.push({
      type: 'Learning exclusion',
      severity: 'high',
      message:
        'Unequal student access to AI tools compounds existing educational inequity. Pair any rollout with a device and connectivity equity plan.',
    });
  }
  if (lt('wf_inclusion', 0.5) || lt('wf_automation_risk', 0.33)) {
    flags.push({
      type: 'Displacement risk',
      severity: 'medium',
      message:
        'High automation exposure with thin inclusive reskilling means vulnerable workers absorb the shock first. Prioritize transition support for at-risk groups.',
    });
  }
  if (lt('hc_data_governance', 0.4) || lt('gov_ai_policy', 0.4)) {
    flags.push({
      type: 'Governance gap',
      severity: 'medium',
      message:
        'Deploying AI without data governance or an AI-use policy invites privacy harm and erodes public trust. Stand up lightweight governance before scaling tools.',
    });
  }
  return flags;
}
