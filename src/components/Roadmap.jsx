import React from 'react';
import { Icon } from './Icons.jsx';

const EFFORT = { Low: 'bg-tier-advanced/15 text-tier-advanced', Medium: 'bg-tier-developing/20 text-[#9a7b15]', High: 'bg-tier-emerging/15 text-tier-emerging' };
const IMPACT = { Low: 'text-slate-faint', Medium: 'text-slate-muted', High: 'text-signal-deep' };

export default function Roadmap({ roadmap }) {
  return (
    <div className="space-y-6">
      {roadmap.map((phase, pi) => (
        <div key={phase.id} className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid place-items-center w-7 h-7 rounded-full bg-ink text-white font-mono text-xs tnum">{pi + 1}</span>
            <div>
              <h4 className="font-display font-bold text-ink leading-none">{phase.name}</h4>
              <p className="text-xs text-slate-muted mt-1">{phase.window} · {phase.focus}</p>
            </div>
          </div>
          <div className="ml-3.5 border-l-2 border-hair pl-6 space-y-2.5">
            {phase.actions.map((a, ai) => (
              <div key={ai} className="relative rounded-lg border border-hair bg-white p-4 hover:shadow-card transition">
                <span className="absolute -left-[1.92rem] top-5 w-2.5 h-2.5 rounded-full bg-signal ring-4 ring-paper" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[14.5px] text-ink">{a.title}</p>
                    <p className="text-[13px] text-slate-muted mt-1 leading-relaxed">{a.detail}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Tag className="bg-paper text-slate-ink border border-hair">{a.sector}</Tag>
                  <Tag className={EFFORT[a.effort]}>{a.effort} effort</Tag>
                  <span className={`text-xs font-medium ${IMPACT[a.impact]} inline-flex items-center gap-1`}>
                    <Icon.target width="13" /> {a.impact} impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Tag({ children, className = '' }) {
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>;
}
