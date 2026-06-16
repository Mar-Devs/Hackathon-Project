import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export default function QuestionCard({ q, value, textValue, onAnswer, onText, index }) {
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <div className="rounded-xl border border-hair bg-white p-5 sm:p-6 shadow-card animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 font-mono text-xs text-slate-faint tnum">{String(index).padStart(2, '0')}</span>
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <p className="text-[15px] font-medium text-ink leading-snug flex-1">{q.prompt}</p>
            {q.tip && (
              <button onClick={() => setTipOpen((v) => !v)} aria-label="More information"
                className="shrink-0 text-slate-faint hover:text-signal-deep mt-0.5">
                <Icon.info width="17" />
              </button>
            )}
          </div>
          {q.indicator && q.type !== 'text' && (
            <p className="eyebrow text-slate-faint mt-1.5">{q.indicator}</p>
          )}
          {tipOpen && q.tip && (
            <div className="mt-3 rounded-lg bg-paper border border-hair px-3.5 py-2.5 text-[13px] text-slate-muted leading-relaxed">
              {q.tip}
            </div>
          )}

          <div className="mt-4">
            {q.type === 'likert' && <Segmented q={q} value={value} onAnswer={onAnswer} />}
            {q.type === 'choice' && <Choices q={q} value={value} onAnswer={onAnswer} />}
            {q.type === 'text' && (
              <textarea value={textValue || ''} onChange={(e) => onText(e.target.value)} rows={2} placeholder={q.placeholder}
                className="w-full rounded-lg border border-hair bg-paper px-3.5 py-3 text-sm text-ink placeholder:text-slate-faint focus:border-signal resize-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Segmented({ q, value, onAnswer }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {q.options.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.label} onClick={() => onAnswer(o.v)}
            className={`rounded-lg border px-2 py-2.5 text-center transition ${
              active ? 'border-signal bg-signal text-white shadow-sm' : 'border-hair bg-white text-slate-ink hover:border-signal/50'
            }`}>
            <span className={`block text-[11px] leading-tight ${active ? 'font-semibold' : ''}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Choices({ q, value, onAnswer }) {
  return (
    <div className="space-y-2">
      {q.options.map((o) => {
        const active = value === o.v;
        return (
          <button key={o.label} onClick={() => onAnswer(o.v)}
            className={`w-full flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition ${
              active ? 'border-signal bg-signal/5 ring-1 ring-signal' : 'border-hair bg-white hover:border-signal/50'
            }`}>
            <span className={`grid place-items-center w-4.5 h-4.5 rounded-full border-2 shrink-0 ${active ? 'border-signal' : 'border-slate-faint'}`}
              style={{ width: 18, height: 18 }}>
              {active && <span className="w-2 h-2 rounded-full bg-signal" />}
            </span>
            <span className={`text-sm ${active ? 'text-ink font-medium' : 'text-slate-ink'}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
