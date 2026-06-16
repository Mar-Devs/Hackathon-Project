// ─────────────────────────────────────────────────────────────────────────────
// Strategic Roadmap Generator (PRD §5.5, AC-09…AC-11).
//
// Produces a phased roadmap of at least 12 specific interventions across four
// phases, each tagged with effort (Low/Medium/High), impact, and responsible
// sector. Interventions are selected from a context-aware library keyed to the
// community's lowest-scoring indicators, then guaranteed to meet the minimum
// count. The AI layer can rewrite the prose; this module guarantees structure.
// ─────────────────────────────────────────────────────────────────────────────

export const PHASES = [
  { id: 'quick', name: 'Quick Wins', window: '0–30 days', focus: 'Foundation actions with immediate impact' },
  { id: 'build', name: 'Build', window: '31–90 days', focus: 'Capacity and infrastructure investments' },
  { id: 'scale', name: 'Scale', window: '91–365 days', focus: 'System-wide integration and adoption' },
  { id: 'sustain', name: 'Sustain', window: 'Year 2+', focus: 'Long-term resilience and equity' },
];

// Library of interventions. Each maps to an indicator id when relevant; generic
// foundation/sustain actions have no indicator. effort/impact ∈ Low|Medium|High.
const LIBRARY = [
  // ── Quick Wins (foundation) ──────────────────────────────────────────────
  { phase: 'quick', sector: 'Government', title: 'Form a cross-sector AI task force', detail: 'Convene education, workforce, health, and IT leads into a standing readiness group with a named chair.', effort: 'Low', impact: 'High', generic: true },
  { phase: 'quick', sector: 'Government', title: 'Audit existing tools and data', detail: 'Inventory the AI tools, datasets, and digital services already in use to establish a true baseline.', effort: 'Low', impact: 'Medium', generic: true },
  { phase: 'quick', sector: 'Government', title: 'Set baseline readiness KPIs', detail: 'Adopt this scorecard\u2019s indicators as quarterly KPIs so progress is measurable from day one.', effort: 'Low', impact: 'Medium', generic: true },
  { phase: 'quick', sector: 'Education', title: 'Publish an interim AI-use policy', detail: 'Issue clear interim guidance on acceptable AI use for staff and students while a full policy is drafted.', effort: 'Low', impact: 'Medium', indicator: 'edu_policy' },
  { phase: 'quick', sector: 'Government', title: 'Draft an AI ethics statement', detail: 'Publish a short responsible-AI commitment covering transparency, privacy, and accountability.', effort: 'Low', impact: 'Medium', indicator: 'gov_ai_policy' },
  { phase: 'quick', sector: 'Infrastructure', title: 'Map connectivity dead zones', detail: 'Use existing coverage data plus a quick resident survey to locate the worst-served neighborhoods.', effort: 'Low', impact: 'High', indicator: 'inf_broadband' },
  { phase: 'quick', sector: 'Healthcare', title: 'Stand up a data-governance working group', detail: 'Bring providers together to agree minimal patient-data handling rules before any AI pilot.', effort: 'Low', impact: 'Medium', indicator: 'hc_data_governance' },

  // ── Build (capacity) ─────────────────────────────────────────────────────
  { phase: 'build', sector: 'Education', title: 'Launch a teacher AI training cohort', detail: 'Fund release time and a structured program so a first cohort of educators can teach AI literacy confidently.', effort: 'Medium', impact: 'High', indicator: 'edu_teacher_training' },
  { phase: 'build', sector: 'Education', title: 'Pilot AI literacy in select schools', detail: 'Introduce an age-appropriate AI module in a handful of schools to prove the model before scaling.', effort: 'Medium', impact: 'High', indicator: 'edu_curriculum' },
  { phase: 'build', sector: 'Workforce', title: 'Fund a subsidized reskilling track', detail: 'Partner with a local provider to offer free or subsidized AI/data upskilling for affected workers.', effort: 'High', impact: 'High', indicator: 'wf_reskilling' },
  { phase: 'build', sector: 'Workforce', title: 'Convene an employer skills council', detail: 'Get employers and trainers to co-define the AI skills the local economy actually needs.', effort: 'Medium', impact: 'Medium', indicator: 'wf_employer_partnership' },
  { phase: 'build', sector: 'Government', title: 'Adopt AI-ready procurement criteria', detail: 'Add bias-testing, transparency, and exit-clause requirements to technology procurement.', effort: 'Medium', impact: 'Medium', indicator: 'gov_procurement' },
  { phase: 'build', sector: 'Healthcare', title: 'Accelerate EHR adoption', detail: 'Support remaining providers to digitize records — the prerequisite for any clinical AI.', effort: 'High', impact: 'High', indicator: 'hc_ehr' },
  { phase: 'build', sector: 'Infrastructure', title: 'Launch a connectivity affordability program', detail: 'Stand up subsidies or community Wi-Fi targeting the dead zones mapped in phase one.', effort: 'High', impact: 'High', indicator: 'inf_affordability' },
  { phase: 'build', sector: 'Government', title: 'Train public-sector project leads', detail: 'Upskill staff to scope, evaluate, and oversee AI projects responsibly.', effort: 'Medium', impact: 'Medium', indicator: 'gov_capacity' },

  // ── Scale (integration) ──────────────────────────────────────────────────
  { phase: 'scale', sector: 'Education', title: 'Roll out AI curriculum district-wide', detail: 'Extend the proven literacy model to all schools with sustained teacher support.', effort: 'High', impact: 'High', indicator: 'edu_curriculum' },
  { phase: 'scale', sector: 'Workforce', title: 'Run a community AI-skills campaign', detail: 'Mount a broad upskilling push with employer placement pathways at the end.', effort: 'High', impact: 'High', indicator: 'wf_digital_skills' },
  { phase: 'scale', sector: 'Healthcare', title: 'Deploy AI triage in priority clinics', detail: 'Move from pilot to operational use of AI triage/diagnostics where data governance is ready.', effort: 'High', impact: 'High', indicator: 'hc_diagnostics' },
  { phase: 'scale', sector: 'Government', title: 'Digitize high-volume public services', detail: 'Bring the most-used resident services fully online with accessible, inclusive design.', effort: 'High', impact: 'Medium', indicator: 'gov_egov' },
  { phase: 'scale', sector: 'Infrastructure', title: 'Expand broadband to underserved areas', detail: 'Close the mapped last-mile gaps through public-private build-out.', effort: 'High', impact: 'High', indicator: 'inf_broadband' },
  { phase: 'scale', sector: 'Government', title: 'Publish open datasets', detail: 'Release machine-readable open data so local builders can create AI services.', effort: 'Medium', impact: 'Medium', indicator: 'gov_open_data' },

  // ── Sustain (resilience & equity) ────────────────────────────────────────
  { phase: 'sustain', sector: 'Government', title: 'Schedule annual re-assessment', detail: 'Re-run this readiness assessment yearly and report movement publicly.', effort: 'Low', impact: 'Medium', generic: true },
  { phase: 'sustain', sector: 'Government', title: 'Conduct an equity audit', detail: 'Audit who is benefiting from AI services and correct exclusion patterns deliberately.', effort: 'Medium', impact: 'High', generic: true },
  { phase: 'sustain', sector: 'Government', title: 'Establish cross-sector coordination', detail: 'Make the task force permanent with a budget line and a public dashboard.', effort: 'Medium', impact: 'Medium', generic: true },
  { phase: 'sustain', sector: 'Workforce', title: 'Institutionalize continuous reskilling', detail: 'Fund reskilling as an ongoing service, not a one-off grant cycle.', effort: 'High', impact: 'High', indicator: 'wf_career_services' },
];

const PHASE_ORDER = { quick: 0, build: 1, scale: 2, sustain: 3 };

// Build a roadmap from results. Picks interventions whose target indicator is
// weak, fills with generic foundation/sustain actions, then guarantees ≥12
// items spread across all four phases (AC-09).
export function generateRoadmap(results) {
  const weak = new Set();
  for (const s of results.sectors) {
    for (const g of s.contribs) if (g.score < 70) weak.add(g.id);
  }

  const chosen = LIBRARY.filter((it) => it.generic || (it.indicator && weak.has(it.indicator)));

  // AC-13: for every sector flagged below the equity threshold, guarantee a
  // dedicated, sector-named equity-focused intervention in the Quick Wins phase.
  for (const flag of results.equityFlags || []) {
    chosen.unshift({
      phase: 'quick',
      sector: flag.sectorName,
      title: `Launch an equity response for ${flag.sectorName}`,
      detail: `${flag.sectorName} scores ${flag.score}/100, below the equity threshold. Convene affected residents, map exclusion drivers, and fund a targeted access intervention before scaling anything else in this sector.`,
      effort: 'Medium',
      impact: 'High',
      equity: true,
      generic: true,
    });
  }

  // Ensure every phase has at least two items; backfill from the library.
  for (const phase of PHASES) {
    let inPhase = chosen.filter((c) => c.phase === phase.id);
    if (inPhase.length < 2) {
      const extras = LIBRARY.filter(
        (it) => it.phase === phase.id && !chosen.includes(it)
      ).slice(0, 2 - inPhase.length);
      chosen.push(...extras);
    }
  }

  // Guarantee the 12-item minimum.
  if (chosen.length < 12) {
    for (const it of LIBRARY) {
      if (chosen.length >= 12) break;
      if (!chosen.includes(it)) chosen.push(it);
    }
  }

  const ranked = chosen
    .map((it, i) => ({ ...it, _i: i }))
    .sort((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] || a._i - b._i);

  return PHASES.map((phase) => ({
    ...phase,
    actions: ranked
      .filter((r) => r.phase === phase.id)
      .map(({ _i, generic, indicator, ...rest }) => rest),
  }));
}

export function countInterventions(roadmap) {
  return roadmap.reduce((n, p) => n + p.actions.length, 0);
}
