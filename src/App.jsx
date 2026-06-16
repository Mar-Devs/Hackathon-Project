import { useEffect, useMemo, useState } from 'react';
import Onboarding from './components/Onboarding.jsx';
import Assessment from './components/Assessment.jsx';
import Scorecard from './components/Scorecard.jsx';
import RadarChart from './components/RadarChart.jsx';
import { SectorIcon } from './components/Icons.jsx';
import { SECTORS, TIERS, SCORED_QUESTION_COUNT } from './data/sectors.js';
import { computeResults } from './lib/scoring.js';
import { generateRoadmap, countInterventions } from './lib/roadmap.js';
import { analyzeWithAI } from './lib/ai.js';
import { exportPDF, exportCSV, exportJSON } from './lib/pdf.js';
import {
  saveDraft, loadDraft, clearDraft,
  saveAssessment, historyFor,
} from './lib/storage.js';

const STAGES = ['landing', 'onboarding', 'assessment', 'analyzing', 'results'];

// A small illustrative readiness profile used purely to animate the hero instrument.
const DEMO_SECTORS = SECTORS.map((s, i) => ({
  ...s,
  score: [72, 54, 61, 48, 80][i] ?? 60,
  tier: TIERS[0],
}));

export default function App() {
  const [stage, setStage] = useState('landing');
  const [context, setContext] = useState(null);
  const [answers, setAnswers] = useState({});      // scored questions: id -> numeric value
  const [text, setText] = useState({});            // free-text questions: id -> string
  const [results, setResults] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [history, setHistory] = useState([]);
  const [hasDraft, setHasDraft] = useState(false);

  // Detect a resumable draft on first load (AC-02).
  useEffect(() => {
    const d = loadDraft();
    if (d && (Object.keys(d.answers || {}).length || d.context)) setHasDraft(true);
  }, []);

  // Persist progress continuously while assessing so refresh/return never loses work.
  useEffect(() => {
    if (stage === 'assessment' || stage === 'onboarding') {
      saveDraft({ stage, context, answers, text });
    }
  }, [stage, context, answers, text]);

  const resumeDraft = () => {
    const d = loadDraft();
    if (!d) return;
    setContext(d.context || null);
    setAnswers(d.answers || {});
    setText(d.text || {});
    setHasDraft(false);
    setStage(d.context ? 'assessment' : 'onboarding');
  };

  const startFresh = () => {
    clearDraft();
    setContext(null); setAnswers({}); setText({});
    setResults(null); setRoadmap(null); setNarrative(null);
    setHasDraft(false);
    setStage('onboarding');
  };

  const onOnboardComplete = (ctx) => {
    setContext(ctx);
    setStage('assessment');
  };

  const onChange = (id, v) => setAnswers((p) => ({ ...p, [id]: v }));
  const onTextChange = (id, v) => setText((p) => ({ ...p, [id]: v }));

  const onSaveExit = () => {
    saveDraft({ stage: 'assessment', context, answers, text });
    setStage('landing');
    setHasDraft(true);
  };

  const runAnalysis = async () => {
    setStage('analyzing');
    // Free-text answers are passed to the AI layer via context.freeText.
    const ctx = { ...context, freeText: text };
    const res = computeResults(answers, ctx);
    const rm = generateRoadmap(res);
    setResults(res);
    setRoadmap(rm);

    // AI enrichment with graceful deterministic fallback (never blocks the result).
    let narr;
    try {
      narr = await analyzeWithAI(res, rm);
    } catch {
      narr = null;
    }
    setNarrative(narr);

    // Persist completed assessment for longitudinal tracking (G5 / US-05).
    saveAssessment(res);
    setHistory(historyFor(res.context?.communityName));

    clearDraft();
    setStage('results');
  };

  const onRestart = () => {
    clearDraft();
    setContext(null); setAnswers({}); setText({});
    setResults(null); setRoadmap(null); setNarrative(null);
    setStage('landing');
  };

  const onReassess = () => {
    // Keep community context; clear answers to measure change over time.
    setAnswers({}); setText({});
    setResults(null); setRoadmap(null); setNarrative(null);
    setStage('assessment');
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {stage === 'landing' && (
        <Landing hasDraft={hasDraft} onStart={startFresh} onResume={resumeDraft} />
      )}

      {stage === 'onboarding' && (
        <Shell>
          <Onboarding
            initial={context || undefined}
            onComplete={onOnboardComplete}
            onBack={() => setStage('landing')}
          />
        </Shell>
      )}

      {stage === 'assessment' && (
        <Assessment
          answers={answers}
          text={text}
          onChange={onChange}
          onTextChange={onTextChange}
          onSubmit={runAnalysis}
          onSaveExit={onSaveExit}
        />
      )}

      {stage === 'analyzing' && <Analyzing context={context} />}

      {stage === 'results' && results && (
        <Scorecard
          results={results}
          roadmap={roadmap}
          narrative={narrative}
          history={history}
          onRestart={onRestart}
          onReassess={onReassess}
          onExportPDF={() => exportPDF(results, roadmap, narrative)}
          onExportCSV={() => exportCSV(results)}
          onExportJSON={() => exportJSON(results, roadmap, narrative)}
        />
      )}
    </div>
  );
}

function Shell({ children }) {
  return <div className="mx-auto max-w-3xl px-5 py-10 md:py-16">{children}</div>;
}

/* ----------------------------- Landing / hero ----------------------------- */

function Landing({ hasDraft, onStart, onResume }) {
  return (
    <div className="relative overflow-hidden">
      {/* ambient grid + glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(14,27,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,27,42,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(14,165,164,0.18), transparent 65%)' }}
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">CARB</span>
        </div>
        <span className="eyebrow hidden text-ink/50 sm:block">
          Community AI Readiness Blueprint
        </span>
      </header>

      <main className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-24 pt-6 md:grid-cols-2 md:gap-14 md:pt-16">
        <div>
          <div className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Decision-support instrument
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Measure your community&rsquo;s readiness for the{' '}
            <span className="text-signal">AI era</span>.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70 md:text-lg">
            A structured, multi-sector assessment that scores readiness across education,
            workforce, healthcare, government, and infrastructure &mdash; then generates a
            phased, prioritized roadmap you can act on.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-lift transition hover:translate-y-[-1px] hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Start assessment
            </button>
            {hasDraft && (
              <button
                onClick={onResume}
                className="rounded-xl border border-ink/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Resume saved draft
              </button>
            )}
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-ink/10 pt-6">
            <Stat k="5" v="sectors weighted" />
            <Stat k={`${SCORED_QUESTION_COUNT}+`} v="scored indicators" />
            <Stat k="<15" v="minutes to complete" />
          </dl>
        </div>

        {/* Signature instrument */}
        <div className="relative">
          <div className="mx-auto max-w-sm rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-lift backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-ink/50">Readiness profile</span>
              <span className="font-mono text-xs text-ink/40">live preview</span>
            </div>
            <RadarChart sectors={DEMO_SECTORS} size={320} />
            <div className="mt-4 grid grid-cols-5 gap-1.5">
              {SECTORS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-ink/60"><SectorIcon name={s.icon} className="h-4 w-4" /></span>
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink/45">
                    {s.short || s.name.slice(0, 4)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <section className="relative border-t border-ink/10 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
          <Feature
            n="01"
            title="Assess"
            body="Answer weighted indicators across five sectors with adaptive follow-ups and plain-language tooltips."
          />
          <Feature
            n="02"
            title="Score"
            body="Get a 0–100 readiness index, tier, percentile against peer communities, and an equity-flagged radar."
          />
          <Feature
            n="03"
            title="Roadmap"
            body="Receive 12+ prioritized interventions across four phases — exportable as a policy-grade PDF, CSV, or JSON."
          />
        </div>
      </section>

      <footer className="relative border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-ink/50 sm:flex-row sm:items-center">
          <span>Outputs are AI-assisted recommendations, not professional consulting advice.</span>
          <span className="font-mono">No PII collected · WCAG 2.1 AA</span>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="7" fill="#0E1B2A" />
      <circle cx="14" cy="14" r="8" stroke="#0EA5A4" strokeWidth="1.5" opacity="0.5" />
      <circle cx="14" cy="14" r="4.5" stroke="#0EA5A4" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="1.5" fill="#0EA5A4" />
    </svg>
  );
}

function Stat({ k, v }) {
  return (
    <div>
      <dt className="font-display text-2xl font-bold tracking-tight tnum">{k}</dt>
      <dd className="mt-0.5 text-xs leading-tight text-ink/55">{v}</dd>
    </div>
  );
}

function Feature({ n, title, body }) {
  return (
    <div>
      <div className="mb-3 font-mono text-xs text-signal">{n}</div>
      <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{body}</p>
    </div>
  );
}

/* ------------------------------- Analyzing -------------------------------- */

function Analyzing({ context }) {
  const steps = useMemo(
    () => [
      'Scoring weighted indicators',
      'Benchmarking against peer communities',
      'Identifying critical gaps and quick wins',
      'Generating phased roadmap',
    ],
    []
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => Math.min(p + 1, steps.length - 1)), 700);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto mb-8 h-20 w-20">
          <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-ink/10 border-t-signal" />
          <div className="absolute inset-3 rounded-full border border-signal/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-signal" />
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Analyzing {context?.communityName || 'your community'}
        </h2>
        <ul className="mt-5 space-y-2 text-left">
          {steps.map((s, idx) => (
            <li
              key={s}
              className={`flex items-center gap-2.5 text-sm transition ${
                idx <= i ? 'text-ink' : 'text-ink/35'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                  idx < i ? 'bg-tier-advanced text-white' : idx === i ? 'bg-signal text-white' : 'border border-ink/20'
                }`}
              >
                {idx < i ? '✓' : ''}
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
