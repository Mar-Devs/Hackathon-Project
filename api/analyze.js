// ─────────────────────────────────────────────────────────────────────────────
// /api/analyze  —  serverless AI intelligence endpoint (Vercel Node function).
//
// Holds the Anthropic API key server-side and turns the deterministic results
// into a policy-grade narrative. Returns strict JSON. If no key is configured
// it responds 501 so the client cleanly falls back to its deterministic
// narrative — the product never breaks on a missing key.
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = process.env.CARB_MODEL || 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // No AI configured — tell the client to use its deterministic fallback.
    res.status(501).json({ error: 'AI not configured' });
    return;
  }

  try {
    const { results, roadmap } = req.body || {};
    if (!results) {
      res.status(400).json({ error: 'Missing results' });
      return;
    }

    const prompt = buildPrompt(results, roadmap);
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1600,
        system:
          'You are a senior public-sector AI strategy advisor producing concise, policy-grade ' +
          'analysis for a community readiness scorecard. You receive already-computed scores; ' +
          'never invent or change numbers. Write plainly for non-technical decision-makers. ' +
          'Respond with ONLY a JSON object, no markdown, no preamble.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      res.status(502).json({ error: 'Upstream error', detail: text.slice(0, 300) });
      return;
    }

    const data = await r.json();
    const raw = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const json = safeParse(raw);
    if (!json || !json.executiveSummary) {
      res.status(502).json({ error: 'Unparseable AI response' });
      return;
    }

    res.status(200).json({
      executiveSummary: json.executiveSummary,
      gapNarratives: json.gapNarratives || [],
      closing: json.closing || '',
      confidence: json.confidence || 'Moderate',
    });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', detail: String(err).slice(0, 200) });
  }
}

function buildPrompt(results, roadmap) {
  return [
    'Here is a community AI-readiness assessment result (numbers are final — do not change them):',
    '```json',
    JSON.stringify(results, null, 2),
    '```',
    roadmap ? 'A draft roadmap exists with ' + countActions(roadmap) + ' interventions across 4 phases.' : '',
    '',
    'Return ONLY this JSON shape:',
    '{',
    '  "executiveSummary": "120-180 words. Name the community, its index/tier/percentile, strongest and weakest sectors, and what to prioritize. Plain language.",',
    '  "gapNarratives": [ { "indicator": "...", "sector": "...", "why": "1-2 sentences on why this gap matters and the fastest credible fix" } ],',
    '  "closing": "2-3 sentences on equity and sustaining momentum",',
    '  "confidence": "High | Moderate | Low — based on how complete the assessment data looks"',
    '}',
    'Provide one gapNarratives entry per critical gap in the input.',
  ].join('\n');
}

function countActions(roadmap) {
  try {
    return roadmap.reduce((n, p) => n + (p.actions?.length || 0), 0);
  } catch {
    return 0;
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
