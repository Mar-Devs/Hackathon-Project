import React, { useState } from 'react';
import RadarChart from './RadarChart.jsx';
import Roadmap from './Roadmap.jsx';
import { SectorIcon, Icon } from './Icons.jsx';
import { countInterventions } from '../lib/roadmap.js';

export default function Scorecard({ results, roadmap, narrative, history, onRestart, onReassess, onExportPDF, onExportCSV, onExportJSON }) {
  const tier = results.overallTier;
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="pb-24">
      {/* Header band */}
      <div className="bg-ink text-white">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="eyebrow text-signal-glow">AI Readiness Scorecard</p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
                {results.context?.communityName || 'Your Community'}
              </h1>
              <p className="text-slate-faint text-sm mt-2">
                {labelType(results.context?.communityType)} · {results.context?.populationBracket} ·
                {' '}Generated {new Date(results.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="relative">
              <button onClick={() => setExportOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-5 py-3 font-semibold text-white hover:bg-signal-deep transition">
                <Icon.download width="18" /> Export
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-hair bg-white shadow-lift overflow-hidden z-30">
                  {[['PDF report', onExportPDF], ['CSV data', onExportCSV], ['JSON', onExportJSON]].map(([l, fn]) => (
                    <button key={l} onClick={() => { fn(); setExportOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-slate-ink hover:bg-paper">{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 -mt-6">
        {/* Index + radar */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          <div className="rounded-2xl bg-white border border-hair shadow-card p-7 flex flex-col items-center justify-center text-center">
            <p className="eyebrow text-slate-faint">Overall Readiness Index</p>
            <div className="my-3 count-fade">
              <span className="font-display text-7xl font-extrabold tracking-tighter tnum" style={{ color: tier.hex }}>
                {results.overall}
              </span>
              <span className="text-2xl text-slate-faint font-display">/100</span>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ background: tier.hex }}>
              {tier.name}
            </span>
            <p className="text-xs text-slate-muted mt-3 leading-relaxed">{tier.blurb}</p>
            <div className="mt-4 pt-4 border-t border-hair w-full">
              <p className="text-sm text-slate-ink">
                <span className="font-display font-bold text-lg tnum" style={{ color: tier.hex }}>{results.overallPctLabel}</span>
                {' '}percentile among similar communities
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-hair shadow-card p-6 flex items-center justify-center">
            <RadarChart sectors={results.sectors} size={380} />
          </div>
        </div>

        {/* Executive summary */}
        <Section title="Executive summary" icon="chart" sub={
          <SourceBadge source={narrative?.source} confidence={narrative?.confidence} />
        }>
          <p className="text-[15px] text-slate-ink leading-relaxed">{narrative?.executiveSummary}</p>
          {narrative?.closing && <p className="text-[15px] text-slate-ink leading-relaxed mt-3">{narrative.closing}</p>}
        </Section>

        {/* Sector breakdown */}
        <Section title="Sector breakdown" icon="layers">
          <div className="grid sm:grid-cols-2 gap-4">
            {results.sectors.map((s) => (
              <div key={s.id} className="rounded-xl border border-hair bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-lg bg-paper text-ink">
                      <SectorIcon name={s.icon} width="18" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink text-sm">{s.name}</p>
                      <p className="text-[11px] text-slate-faint">{s.focus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-2xl tnum" style={{ color: s.tier.hex }}>{s.score}</span>
                    <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: s.tier.hex }}>{s.tier.name}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-paper overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, background: s.tier.hex }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-tier-advanced font-semibold mb-1">Strengths</p>
                    <ul className="space-y-0.5 text-slate-muted">
                      {s.strengths.slice(0, 2).map((x) => <li key={x.id}>· {x.indicator}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-tier-emerging font-semibold mb-1">Gaps</p>
                    <ul className="space-y-0.5 text-slate-muted">
                      {s.gaps.slice(0, 2).map((x) => <li key={x.id}>· {x.indicator}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Benchmark */}
        <Section title="Peer benchmark" icon="target" sub={<span className="text-xs text-slate-faint">vs anonymized similar communities</span>}>
          <div className="space-y-3">
            {results.benchmarks.map((b) => (
              <div key={b.id} className="flex items-center gap-4">
                <span className="w-28 text-sm text-slate-ink shrink-0">{b.name}</span>
                <div className="flex-1 relative h-6 rounded-md bg-paper">
                  <div className="absolute inset-y-0 left-0 rounded-md bg-ink/85" style={{ width: `${b.score}%` }} />
                  <div className="absolute inset-y-0 w-0.5 bg-tier-emerging" style={{ left: `${b.peer}%` }} title={`Peer median ${b.peer}`} />
                </div>
                <span className={`w-14 text-right text-xs font-semibold tnum ${b.delta >= 0 ? 'text-tier-advanced' : 'text-tier-emerging'}`}>
                  {b.delta >= 0 ? '+' : ''}{b.delta}
                </span>
              </div>
            ))}
            <p className="text-xs text-slate-faint pt-1">Bar = your score · vertical mark = peer median</p>
          </div>
        </Section>

        {/* Gaps + quick wins */}
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          <Card title="Critical gaps" accent="#D9534F" icon="alert">
            {results.criticalGaps.map((g, i) => (
              <Item key={g.id} n={i + 1} title={g.indicator} sub={`${g.sectorName} · ${g.score}/100`} hex="#D9534F" />
            ))}
          </Card>
          <Card title="Quick wins" accent="#0EA5A4" icon="spark">
            {results.quickWins.map((q, i) => (
              <Item key={q.id} n={i + 1} title={q.indicator} sub={`${q.sectorName} · ${q.score}/100`} hex="#0EA5A4" />
            ))}
          </Card>
        </div>

        {/* Equity + risk */}
        {(results.equityFlags.length > 0 || results.riskFlags.length > 0) && (
          <Section title="Equity & risk flags" icon="flag">
            <div className="space-y-3">
              {results.equityFlags.map((e) => (
                <Flag key={e.sectorId} label="Equity" hex="#D9534F" text={e.message} />
              ))}
              {results.riskFlags.map((f, i) => (
                <Flag key={i} label={f.type} hex={f.severity === 'high' ? '#D9534F' : '#E0B341'} text={f.message} />
              ))}
            </div>
          </Section>
        )}

        {/* Trend */}
        {history && history.length > 1 && (
          <Section title="Progress over time" icon="clock">
            <Trend history={history} />
          </Section>
        )}

        {/* Roadmap */}
        <Section title="Strategic roadmap" icon="layers" sub={
          <span className="text-xs text-slate-faint">{countInterventions(roadmap)} interventions · 4 phases</span>
        }>
          <Roadmap roadmap={roadmap} />
        </Section>

        {/* Disclosure + actions */}
        <div className="mt-8 rounded-xl bg-paper border border-hair p-4 flex items-start gap-3">
          <Icon.info width="18" className="text-slate-faint mt-0.5 shrink-0" />
          <p className="text-xs text-slate-muted leading-relaxed">
            These are AI-assisted and rules-based recommendations from CARB — decision-support, not
            professional consulting, legal, or financial advice. Validate against local data before acting.
            No personally identifiable information was collected.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onReassess} className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-white font-semibold hover:bg-ink-soft transition">
            <Icon.refresh width="17" /> Re-assess this community
          </button>
          <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-lg border border-hair bg-white px-5 py-3 text-slate-ink font-semibold hover:border-slate-faint transition">
            New community
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, sub, children }) {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-ink/5 text-ink"><SectorIcon name={icon} width="17" /></span>
          <h3 className="font-display text-xl font-bold text-ink tracking-tight">{title}</h3>
        </div>
        {sub}
      </div>
      <div className="rounded-2xl border border-hair bg-white shadow-card p-6">{children}</div>
    </div>
  );
}

function Card({ title, accent, icon, children }) {
  return (
    <div className="rounded-2xl border border-hair bg-white shadow-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: accent }}><SectorIcon name={icon} width="18" /></span>
        <h3 className="font-display font-bold text-ink">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Item({ n, title, sub, hex }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full text-[11px] font-bold text-white tnum shrink-0" style={{ background: hex }}>{n}</span>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-slate-muted">{sub}</p>
      </div>
    </div>
  );
}

function Flag({ label, hex, text }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-hair bg-paper/60 p-3.5">
      <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: hex }}>{label}</span>
      <p className="text-[13px] text-slate-ink leading-relaxed">{text}</p>
    </div>
  );
}

function SourceBadge({ source, confidence }) {
  const ai = source === 'ai';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-paper px-2.5 py-1 text-[11px] font-medium text-slate-muted">
      <Icon.spark width="12" className={ai ? 'text-signal-deep' : 'text-slate-faint'} />
      {ai ? 'AI-assisted' : 'Deterministic'} · {confidence || 'n/a'}
    </span>
  );
}

function Trend({ history }) {
  const w = 600, h = 120, pad = 24;
  const xs = history.map((_, i) => pad + (i / Math.max(1, history.length - 1)) * (w - pad * 2));
  const ys = history.map((d) => h - pad - (d.overall / 100) * (h - pad * 2));
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x},${ys[i]}`).join(' ');
  const first = history[0].overall, last = history[history.length - 1].overall;
  return (
    <div>
      <p className="text-sm text-slate-ink mb-3">
        Overall index moved from <b className="tnum">{first}</b> to <b className="tnum">{last}</b>
        {' '}(<span className={last >= first ? 'text-tier-advanced' : 'text-tier-emerging'}>{last - first >= 0 ? '+' : ''}{last - first}</span>) across {history.length} assessments.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <path d={path} fill="none" stroke="#0EA5A4" strokeWidth="2.5" />
        {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="4" fill="#0EA5A4" stroke="#fff" strokeWidth="1.5" />)}
      </svg>
    </div>
  );
}

function labelType(t) {
  return ({ urban: 'Urban', suburban: 'Suburban', rural: 'Rural', remote: 'Remote' }[t]) || 'Community';
}
