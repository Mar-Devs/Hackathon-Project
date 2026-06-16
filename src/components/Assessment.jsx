import React, { useMemo, useState } from 'react';
import { SECTORS } from '../data/sectors.js';
import { isActive } from '../lib/scoring.js';
import QuestionCard from './QuestionCard.jsx';
import { SectorIcon, Icon } from './Icons.jsx';

export default function Assessment({ answers, text, onChange, onTextChange, onSubmit, onSaveExit }) {
  const [si, setSi] = useState(0);
  const sector = SECTORS[si];

  // Active questions for this sector (adaptive follow-ups appear inline).
  const visible = useMemo(
    () => sector.questions.filter((q) => isActive(q, answers)),
    [sector, answers]
  );

  // Global progress across all scored, currently-active questions.
  const { answered, totalScored } = useMemo(() => {
    let a = 0, t = 0;
    for (const s of SECTORS) {
      for (const q of s.questions) {
        if (q.scored === false || !isActive(q, answers)) continue;
        t += 1;
        if (answers[q.id] != null) a += 1;
      }
    }
    return { answered: a, totalScored: t };
  }, [answers]);

  const pct = totalScored ? Math.round((answered / totalScored) * 100) : 0;
  const isLast = si === SECTORS.length - 1;

  const sectorComplete = visible
    .filter((q) => q.scored !== false)
    .every((q) => answers[q.id] != null);

  const next = () => {
    if (isLast) onSubmit();
    else { setSi((i) => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const prev = () => { setSi((i) => Math.max(0, i - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen pb-32">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-hair">
        <div className="max-w-3xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              {SECTORS.map((s, i) => (
                <button key={s.id} onClick={() => setSi(i)} title={s.name}
                  className={`h-1.5 rounded-full transition-all ${i === si ? 'w-8 bg-signal' : i < si ? 'w-4 bg-signal/40' : 'w-4 bg-hair'}`} />
              ))}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-mono text-xs text-slate-muted tnum">{answered}/{totalScored} · {pct}%</span>
              <button onClick={onSaveExit} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-ink hover:text-ink">
                <Icon.save width="14" /> Save &amp; exit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 pt-8">
        {/* Sector header */}
        <div className="flex items-center gap-3.5 mb-1">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-ink text-signal-glow">
            <SectorIcon name={sector.icon} width="22" />
          </span>
          <div>
            <p className="eyebrow text-slate-faint">Sector {si + 1} of {SECTORS.length} · Weight {Math.round(sector.weight * 100)}%</p>
            <h2 className="font-display text-2xl font-bold text-ink tracking-tight">{sector.name}</h2>
          </div>
        </div>
        <p className="text-slate-muted text-sm mb-7 ml-[3.6rem]">{sector.blurb}</p>

        {/* Questions */}
        <div className="space-y-4">
          {visible.map((q, idx) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={idx + 1}
              value={answers[q.id]}
              textValue={text[q.id]}
              onAnswer={(v) => onChange(q.id, v)}
              onText={(v) => onTextChange(q.id, v)}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="mt-9 flex items-center justify-between">
          <button onClick={prev} disabled={si === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-hair bg-white px-5 py-3 text-sm font-medium text-slate-ink disabled:opacity-40 hover:border-slate-faint transition">
            <Icon.arrowLeft width="16" /> Previous
          </button>
          <div className="flex items-center gap-3">
            {!sectorComplete && <span className="text-xs text-slate-faint hidden sm:inline">Answer all to continue</span>}
            <button onClick={next} disabled={!sectorComplete}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-soft transition">
              {isLast ? 'Generate scorecard' : 'Next sector'} <Icon.arrowRight width="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
