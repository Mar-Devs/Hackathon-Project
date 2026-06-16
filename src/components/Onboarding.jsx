import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

const TYPES = [
  { id: 'urban', label: 'Urban', hint: 'Dense city core' },
  { id: 'suburban', label: 'Suburban', hint: 'Town / metro edge' },
  { id: 'rural', label: 'Rural', hint: 'Low-density region' },
  { id: 'remote', label: 'Remote', hint: 'Isolated / hard to reach' },
];
const POPS = ['<10k', '10k–50k', '50k–250k', '250k–1M', '1M+'];
const INSTITUTIONS = ['Local government', 'Nonprofit', 'Education', 'Healthcare', 'Development org'];
const CHALLENGE_TAGS = ['Connectivity', 'Funding', 'Skills gap', 'Policy', 'Equity', 'Data quality', 'Staff capacity', 'Awareness'];
const LITERACY = ['Very low', 'Low', 'Moderate', 'High', 'Very high'];

export default function Onboarding({ initial, onComplete, onBack }) {
  const [f, setF] = useState(() => ({
    communityName: '',
    communityType: '',
    populationBracket: '',
    region: '',
    country: '',
    institution: '',
    literacy: 2,
    tags: [],
    challenges: '',
    ...initial,
  }));

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleTag = (t) =>
    setF((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t].slice(0, 3) }));

  const valid = f.communityName.trim() && f.communityType && f.populationBracket && f.institution;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 animate-fade-up">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-muted hover:text-ink mb-6">
        <Icon.arrowLeft width="16" /> Back
      </button>

      <p className="eyebrow text-signal-deep mb-2">Step 1 of 2 · Context</p>
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
        Tell us about your community
      </h1>
      <p className="text-slate-muted mt-3 leading-relaxed max-w-xl">
        These answers tailor the assessment and recommendations to your context. No personal data
        is collected — everything is community-level.
      </p>

      <div className="mt-10 space-y-8">
        <Field label="Community name" hint="Used to title your scorecard and track progress over time">
          <input
            value={f.communityName}
            onChange={(e) => set('communityName', e.target.value)}
            placeholder="e.g. Riverside County"
            className="w-full rounded-lg border border-hair bg-white px-4 py-3 text-ink placeholder:text-slate-faint focus:border-signal"
          />
        </Field>

        <Field label="Community type">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => set('communityType', t.id)}
                className={`text-left rounded-lg border px-3.5 py-3 transition ${
                  f.communityType === t.id ? 'border-signal bg-signal/5 ring-1 ring-signal' : 'border-hair bg-white hover:border-slate-faint'
                }`}>
                <div className="font-semibold text-sm text-ink">{t.label}</div>
                <div className="text-xs text-slate-muted mt-0.5">{t.hint}</div>
              </button>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-8">
          <Field label="Population size">
            <Pills options={POPS} value={f.populationBracket} onChange={(v) => set('populationBracket', v)} />
          </Field>
          <Field label="Primary institution">
            <Pills options={INSTITUTIONS} value={f.institution} onChange={(v) => set('institution', v)} small />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <Field label="Region / state" hint="Optional">
            <input value={f.region} onChange={(e) => set('region', e.target.value)} placeholder="e.g. Midwest"
              className="w-full rounded-lg border border-hair bg-white px-4 py-3 text-ink placeholder:text-slate-faint focus:border-signal" />
          </Field>
          <Field label="Country" hint="Optional">
            <input value={f.country} onChange={(e) => set('country', e.target.value)} placeholder="e.g. United States"
              className="w-full rounded-lg border border-hair bg-white px-4 py-3 text-ink placeholder:text-slate-faint focus:border-signal" />
          </Field>
        </div>

        <Field label="Baseline AI literacy" hint="Your honest self-rating anchors the assessment">
          <div className="rounded-lg border border-hair bg-white px-4 py-4">
            <input type="range" min="0" max="4" value={f.literacy} onChange={(e) => set('literacy', +e.target.value)} className="w-full" />
            <div className="flex justify-between mt-2 text-xs text-slate-muted">
              {LITERACY.map((l, i) => (
                <span key={l} className={i === f.literacy ? 'text-signal-deep font-semibold' : ''}>{l}</span>
              ))}
            </div>
          </div>
        </Field>

        <Field label="Top challenges" hint="Pick up to 3">
          <div className="flex flex-wrap gap-2">
            {CHALLENGE_TAGS.map((t) => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm border transition ${
                  f.tags.includes(t) ? 'border-ink bg-ink text-white' : 'border-hair bg-white text-slate-ink hover:border-slate-faint'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <textarea value={f.challenges} onChange={(e) => set('challenges', e.target.value)} rows={2}
            placeholder="Anything else shaping your situation? (optional)"
            className="mt-3 w-full rounded-lg border border-hair bg-white px-4 py-3 text-ink placeholder:text-slate-faint focus:border-signal resize-none" />
        </Field>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-xs text-slate-faint">{valid ? 'Ready to begin' : 'Fill the required fields to continue'}</p>
        <button disabled={!valid} onClick={() => onComplete(f)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-soft transition">
          Start assessment <Icon.arrowRight width="18" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <label className="text-sm font-semibold text-ink">{label}</label>
        {hint && <span className="text-xs text-slate-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Pills({ options, value, onChange, small }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`rounded-lg border px-3.5 py-2.5 ${small ? 'text-[13px]' : 'text-sm'} transition ${
            value === o ? 'border-signal bg-signal/5 ring-1 ring-signal text-ink font-medium' : 'border-hair bg-white text-slate-ink hover:border-slate-faint'
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}
