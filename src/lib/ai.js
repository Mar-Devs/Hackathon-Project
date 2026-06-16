// ─────────────────────────────────────────────────────────────────────────────
// AI Intelligence layer (PRD §5.3, Modules 3 & 5).
//
// Enriches the deterministic results with a context-aware narrative: an
// executive summary, sharpened gap explanations, and a closing strategic note.
// It calls the serverless function at /api/analyze (which holds the API key
// server-side). If the AI is unreachable or unconfigured, it falls back to a
// fully deterministic narrative so the product is ALWAYS operational and every
// output carries a clear source indicator (AC-08).
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeWithAI(results, roadmap) {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: slim(results), roadmap }),
    });
    if (!res.ok) throw new Error(`AI endpoint ${res.status}`);
    const data = await res.json();
    if (!data || !data.executiveSummary) throw new Error('Malformed AI response');
    return {
      source: 'ai',
      confidence: data.confidence || 'Moderate',
      ...data,
    };
  } catch (err) {
    // Expected whenever no API key is configured (e.g. local dev / offline).
    return { source: 'rules', confidence: 'Deterministic', ...fallbackNarrative(results) };
  }
}

// Trim results to the fields the prompt needs (keeps token use small).
function slim(r) {
  return {
    context: r.context,
    overall: r.overall,
    tier: r.overallTier.name,
    percentile: r.overallPctLabel,
    sectors: r.sectors.map((s) => ({ name: s.name, score: s.score, tier: s.tier.name })),
    criticalGaps: r.criticalGaps.map((g) => ({ indicator: g.indicator, sector: g.sectorName, score: g.score })),
    quickWins: r.quickWins.map((q) => ({ indicator: q.indicator, sector: q.sectorName, score: q.score })),
    equityFlags: r.equityFlags.map((e) => e.sectorName),
    riskFlags: r.riskFlags.map((f) => f.type),
    freeText: collectFreeText(r.context),
  };
}

function collectFreeText(context) {
  return context?.freeText || {};
}

// ── Deterministic fallback ──────────────────────────────────────────────────
function fallbackNarrative(r) {
  const top = r.sectors.reduce((a, b) => (b.score > a.score ? b : a));
  const low = r.sectors.reduce((a, b) => (b.score < a.score ? b : a));
  const place = r.context?.communityName || 'This community';

  const executiveSummary =
    `${place} has an overall AI Readiness Index of ${r.overall}/100, placing it in the ` +
    `${r.overallTier.name} tier and around the ${r.overallPctLabel} percentile of similar ` +
    `${r.context?.communityType || 'peer'} communities. ${r.overallTier.blurb} Its strongest ` +
    `footing is in ${top.name} (${top.score}/100), while ${low.name} (${low.score}/100) is the ` +
    `clearest drag on overall readiness. Closing the three critical gaps below would move the ` +
    `index most efficiently, and the quick wins offer momentum within the first month.`;

  const gapNarratives = r.criticalGaps.map((g) => ({
    indicator: g.indicator,
    sector: g.sectorName,
    why:
      `At ${g.score}/100, "${g.indicator}" is among the lowest-scoring indicators and sits in the ` +
      `${g.sectorName} sector (weight ${Math.round((r.sectors.find((s) => s.id === g.sectorId)?.weight || 0) * 100)}%). ` +
      `Raising it lifts the overall index more than most other moves.`,
  }));

  const closing =
    r.equityFlags.length > 0
      ? `Equity is the headline risk: ${r.equityFlags
          .map((e) => e.sectorName)
          .join(' and ')} fall below the equity threshold, so any rollout must be paired with ` +
        `deliberate access measures to avoid widening existing divides.`
      : `No sector falls below the equity threshold, but sustaining progress depends on annual ` +
        `re-assessment and keeping the cross-sector task force funded.`;

  return { executiveSummary, gapNarratives, closing };
}
