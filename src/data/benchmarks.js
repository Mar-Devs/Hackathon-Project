// ─────────────────────────────────────────────────────────────────────────────
// Peer benchmark reference set.
//
// Anonymous, aggregate reference distributions used for the "compared to peer
// communities of similar type and size" benchmarking (PRD §5.3, AC-06).
// These are illustrative reference means derived from published readiness
// indices (e.g. OECD AI policy indicators, ITU connectivity data, e-gov
// development indices) rather than identifiable individual communities — no
// PII is involved. They give a credible, deterministic percentile context out
// of the box; swap in your own pooled, anonymized assessment data over time.
// ─────────────────────────────────────────────────────────────────────────────

// Reference overall-index means by community type. spread = std-dev used to
// produce a smooth percentile estimate.
export const PEER_MEANS = {
  urban: { overall: 58, spread: 16, education: 60, workforce: 57, healthcare: 56, government: 61, infrastructure: 72 },
  suburban: { overall: 54, spread: 15, education: 58, workforce: 52, healthcare: 53, government: 55, infrastructure: 68 },
  rural: { overall: 41, spread: 17, education: 44, workforce: 38, healthcare: 39, government: 42, infrastructure: 48 },
  remote: { overall: 33, spread: 18, education: 36, workforce: 30, healthcare: 31, government: 34, infrastructure: 36 },
};

// Population brackets nudge the reference mean slightly (larger places tend to
// have more institutional capacity, smaller places less).
export const POP_ADJUST = {
  '<10k': -4,
  '10k–50k': -2,
  '50k–250k': 0,
  '250k–1M': 3,
  '1M+': 5,
};

// Error-function approximation → normal CDF → percentile (0–100).
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

export function percentile(score, mean, spread) {
  const z = (score - mean) / (spread || 15);
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2));
  return Math.max(1, Math.min(99, Math.round(cdf * 100)));
}

export function peerReference(communityType, populationBracket) {
  const base = PEER_MEANS[communityType] || PEER_MEANS.suburban;
  const adj = POP_ADJUST[populationBracket] ?? 0;
  const out = { ...base, overall: base.overall + adj };
  for (const k of ['education', 'workforce', 'healthcare', 'government', 'infrastructure']) {
    out[k] = Math.max(5, Math.min(95, (base[k] ?? base.overall) + adj));
  }
  return out;
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
