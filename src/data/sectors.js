// ─────────────────────────────────────────────────────────────────────────────
// CARB Assessment Engine — sector & indicator definitions
//
// Scoring model:
//   • Each scored question yields a normalized value in [0,1].
//   • Likert  → options mapped evenly 0 … 1.
//   • Choice  → each option carries an explicit `v` (value in [0,1]).
//   • Text    → context only (scored:false); feeds the AI narrative layer.
//   • A sector score = weighted mean of its scored answers × 100.
//   • Indicators carry an optional `w` (relative weight within the sector;
//     default 1). Adaptive follow-ups use `dependsOn`.
// ─────────────────────────────────────────────────────────────────────────────

const LIKERT_5 = (labels) =>
  labels.map((label, i) => ({ label, v: i / (labels.length - 1) }));

const FREQ = LIKERT_5(['None', 'Minimal', 'Some', 'Substantial', 'Comprehensive']);
const AGREE = LIKERT_5(['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']);
const MATURITY = LIKERT_5(['Nonexistent', 'Early/ad-hoc', 'Defined', 'Managed', 'Optimized']);

export const TIERS = [
  { name: 'Emerging', min: 0, color: 'tier.emerging', hex: '#E07A45', blurb: 'Foundational gaps across most sectors. Focus on access, awareness, and a baseline plan.' },
  { name: 'Developing', min: 40, color: 'tier.developing', hex: '#E0B341', blurb: 'Pockets of capability exist. Prioritize coordination and closing the widest gaps.' },
  { name: 'Advanced', min: 60, color: 'tier.advanced', hex: '#3FA66B', blurb: 'Broad capability with uneven depth. Move from pilots to system-wide integration.' },
  { name: 'Leading', min: 80, color: 'tier.leading', hex: '#1F8A70', blurb: 'Mature, coordinated readiness. Sustain, govern for equity, and share practice.' },
];

export const EQUITY_THRESHOLD = 30; // AC-13: equity flag when a sector scores below this

export const SECTORS = [
  {
    id: 'education',
    name: 'Education',
    weight: 0.25,
    icon: 'book',
    focus: 'AI literacy, curriculum, teacher training',
    blurb: 'How prepared are schools and learners to understand and use AI.',
    questions: [
      { id: 'edu_curriculum', indicator: '% schools with AI curriculum', type: 'choice', prompt: 'What share of schools in your community include any AI or data-literacy content in their curriculum?', tip: 'Includes computer-science electives, embedded modules, or after-school programs that teach how AI works.', options: [
        { label: 'None', v: 0 }, { label: 'A few pilot schools', v: 0.33 }, { label: 'About half', v: 0.66 }, { label: 'Most or all', v: 1 } ] },
      { id: 'edu_teacher_training', indicator: 'Teacher AI training access', type: 'likert', prompt: 'Teachers have access to professional development on using AI tools responsibly in the classroom.', options: AGREE, tip: 'Formal training, stipends, or release time count more than optional webinars.' },
      { id: 'edu_teacher_followup', indicator: 'Training delivery model', type: 'choice', prompt: 'How is that teacher training primarily delivered?', dependsOn: { id: 'edu_teacher_training', whenAtMost: 0.5 }, tip: 'Adaptive follow-up shown when training access is limited.', options: [
        { label: 'Not delivered at all', v: 0 }, { label: 'One-off optional webinars', v: 0.25 }, { label: 'Occasional workshops', v: 0.5 }, { label: 'Structured, funded program', v: 1 } ] },
      { id: 'edu_device_ratio', indicator: 'Student device ratio', type: 'choice', prompt: 'What is the typical student-to-connected-device ratio in classrooms?', tip: 'A device is any laptop/tablet/Chromebook a student can use for learning.', options: [
        { label: 'Worse than 5:1', v: 0 }, { label: '3–5 students per device', v: 0.33 }, { label: '2:1', v: 0.66 }, { label: '1:1 or better', v: 1 } ] },
      { id: 'edu_literacy', indicator: 'Educator AI literacy', type: 'likert', prompt: 'Educators can confidently explain what generative AI is and its limits to students and parents.', options: AGREE, tip: 'Self-rated confidence is fine here; it anchors the literacy baseline.' },
      { id: 'edu_higher_ed', indicator: 'Higher-ed / CTE pathways', type: 'likert', prompt: 'Local colleges or career-technical programs offer AI, data, or automation pathways.', options: FREQ, tip: 'Certificates, associate degrees, or bootcamps all count.' },
      { id: 'edu_policy', indicator: 'School AI-use policy', type: 'choice', prompt: 'Do schools have a published policy governing student and staff use of AI?', tip: 'A policy sets expectations on academic integrity, privacy, and acceptable use.', options: [
        { label: 'No policy', v: 0 }, { label: 'Being drafted', v: 0.4 }, { label: 'Published but not enforced', v: 0.7 }, { label: 'Published and actively used', v: 1 } ] },
      { id: 'edu_equity_access', indicator: 'Equitable learner access', type: 'likert', prompt: 'Students from low-income households have the same practical access to AI learning tools as their peers.', options: AGREE, tip: 'Think about home connectivity, devices, and out-of-school support.' },
      { id: 'edu_context', indicator: 'Education context', type: 'text', scored: false, prompt: 'Briefly: what is the single biggest barrier to AI readiness in your schools?', tip: 'Optional. Feeds tailored recommendations; not scored.', placeholder: 'e.g. teacher bandwidth, funding, connectivity at home…' },
    ],
  },
  {
    id: 'workforce',
    name: 'Workforce',
    weight: 0.25,
    icon: 'briefcase',
    focus: 'Reskilling, employer adoption, displacement',
    blurb: 'How ready local workers and employers are for AI-driven change.',
    questions: [
      { id: 'wf_employer_adoption', indicator: '% employers using AI', type: 'choice', prompt: 'Roughly what share of local employers have adopted AI tools in their operations?', tip: 'Any meaningful use — from customer service bots to analytics — counts.', options: [
        { label: 'Almost none', v: 0 }, { label: 'A small minority', v: 0.33 }, { label: 'Around half', v: 0.66 }, { label: 'A clear majority', v: 1 } ] },
      { id: 'wf_reskilling', indicator: 'Reskilling program availability', type: 'likert', prompt: 'Accessible reskilling or upskilling programs for AI-affected workers are available locally.', options: FREQ, tip: 'Free or subsidized programs weigh more than paid-only options.' },
      { id: 'wf_reskill_followup', indicator: 'Reskilling funding', type: 'choice', prompt: 'How are those reskilling programs funded?', dependsOn: { id: 'wf_reskilling', whenAtMost: 0.5 }, tip: 'Adaptive follow-up shown when reskilling availability is low.', options: [
        { label: 'No funding', v: 0 }, { label: 'Learner-paid only', v: 0.3 }, { label: 'Mixed / grant-dependent', v: 0.6 }, { label: 'Sustained public/employer funding', v: 1 } ] },
      { id: 'wf_automation_risk', indicator: 'Automation risk exposure', type: 'choice', prompt: 'How exposed is your local economy to automation of routine jobs?', tip: 'High concentration in routine roles (clerical, basic manufacturing, transport) raises risk. A higher score means LOWER exposure / better diversification.', options: [
        { label: 'Very high exposure', v: 0 }, { label: 'High', v: 0.33 }, { label: 'Moderate', v: 0.66 }, { label: 'Diversified / low', v: 1 } ] },
      { id: 'wf_employer_partnership', indicator: 'Employer–training partnerships', type: 'likert', prompt: 'Employers actively partner with training providers to define needed AI skills.', options: AGREE, tip: 'Apprenticeships, advisory boards, and co-designed curricula count.' },
      { id: 'wf_career_services', indicator: 'Career-transition support', type: 'likert', prompt: 'Workers displaced by automation can access career counseling and transition support.', options: FREQ, tip: 'Includes job placement, income bridges, and counseling.' },
      { id: 'wf_digital_skills', indicator: 'Baseline digital skills', type: 'likert', prompt: 'The general workforce has the baseline digital skills needed to adopt AI tools.', options: AGREE, tip: 'Comfort with web apps, spreadsheets, and basic data handling.' },
      { id: 'wf_inclusion', indicator: 'Inclusive participation', type: 'likert', prompt: 'Reskilling opportunities reach women, older workers, and rural or marginalized groups equitably.', options: AGREE, tip: 'Consider who is actually enrolling, not just who is eligible.' },
      { id: 'wf_context', indicator: 'Workforce context', type: 'text', scored: false, prompt: 'Briefly: which local industries are most at risk, and which could benefit most from AI?', tip: 'Optional. Sharpens roadmap targeting; not scored.', placeholder: 'e.g. logistics at risk; healthcare and agriculture could benefit…' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    weight: 0.20,
    icon: 'heart',
    focus: 'Data systems, AI diagnostics, staff capacity',
    blurb: 'How prepared local health systems are to use AI safely.',
    questions: [
      { id: 'hc_ehr', indicator: 'EHR adoption rate', type: 'choice', prompt: 'What share of local health providers use electronic health records (EHR)?', tip: 'Digitized records are the foundation for any clinical AI.', options: [
        { label: 'Mostly paper', v: 0 }, { label: 'Some providers', v: 0.33 }, { label: 'Most providers', v: 0.66 }, { label: 'Near-universal, interoperable', v: 1 } ] },
      { id: 'hc_diagnostics', indicator: 'AI diagnostic tool usage', type: 'likert', prompt: 'Health providers use or pilot AI-assisted diagnostics or triage.', options: FREQ, tip: 'Imaging analysis, risk scoring, or symptom triage tools all count.' },
      { id: 'hc_data_governance', indicator: 'Health data governance', type: 'choice', prompt: 'Are there clear policies governing the privacy and use of patient health data?', tip: 'Governance enables AI while protecting patients.', options: [
        { label: 'None', v: 0 }, { label: 'Informal practices', v: 0.4 }, { label: 'Documented policy', v: 0.7 }, { label: 'Enforced & audited', v: 1 } ] },
      { id: 'hc_staff_capacity', indicator: 'Staff AI capacity', type: 'likert', prompt: 'Clinical and administrative staff have the training to use AI tools effectively.', options: AGREE, tip: 'Includes informatics roles and frontline digital comfort.' },
      { id: 'hc_interop', indicator: 'Systems interoperability', type: 'likert', prompt: 'Health data systems can share information across providers when needed.', options: MATURITY, tip: 'Interoperability multiplies the value of any single AI tool.' },
      { id: 'hc_access', indicator: 'Equitable care access', type: 'likert', prompt: 'AI-enabled health services reach rural and underserved populations equitably.', options: AGREE, tip: 'Telehealth and remote monitoring can widen or narrow gaps.' },
      { id: 'hc_telehealth', indicator: 'Telehealth maturity', type: 'likert', prompt: 'Telehealth is an established, reliable option for residents.', options: MATURITY, tip: 'Reliable telehealth signals digital-health readiness.' },
      { id: 'hc_context', indicator: 'Healthcare context', type: 'text', scored: false, prompt: 'Briefly: what is the most pressing health-data or capacity gap locally?', tip: 'Optional. Not scored.', placeholder: 'e.g. fragmented records, no informatics staff, rural connectivity…' },
    ],
  },
  {
    id: 'government',
    name: 'Government',
    weight: 0.20,
    icon: 'building',
    focus: 'Digital services, policy, procurement',
    blurb: 'How ready local government is to deploy and govern AI.',
    questions: [
      { id: 'gov_egov', indicator: 'e-Government maturity', type: 'likert', prompt: 'Residents can complete most government services online.', options: MATURITY, tip: 'Permits, payments, benefits, records — end to end online.' },
      { id: 'gov_ai_policy', indicator: 'AI ethics / governance policy', type: 'choice', prompt: 'Does the government have a policy governing its own use of AI?', tip: 'Covers procurement, transparency, and acceptable-use of AI by agencies.', options: [
        { label: 'No policy', v: 0 }, { label: 'In development', v: 0.4 }, { label: 'Adopted', v: 0.7 }, { label: 'Adopted & monitored', v: 1 } ] },
      { id: 'gov_policy_followup', indicator: 'Policy accountability', type: 'likert', prompt: 'There is a named owner or office accountable for responsible AI in government.', dependsOn: { id: 'gov_ai_policy', whenAtMost: 0.4 }, options: AGREE, tip: 'Adaptive follow-up shown when AI policy is immature.' },
      { id: 'gov_open_data', indicator: 'Open data availability', type: 'likert', prompt: 'Government publishes useful open datasets the community can build on.', options: FREQ, tip: 'Machine-readable, regularly updated data scores higher.' },
      { id: 'gov_procurement', indicator: 'AI-ready procurement', type: 'likert', prompt: 'Procurement processes can evaluate and acquire AI solutions responsibly.', options: MATURITY, tip: 'Includes vendor evaluation, bias testing, and exit clauses.' },
      { id: 'gov_capacity', indicator: 'Staff digital capacity', type: 'likert', prompt: 'Public-sector staff have the skills to manage AI projects.', options: AGREE, tip: 'Project management, data literacy, and vendor oversight.' },
      { id: 'gov_transparency', indicator: 'Algorithmic transparency', type: 'likert', prompt: 'When AI informs public decisions, the logic is explainable to residents.', options: AGREE, tip: 'Transparency builds trust and surfaces bias early.' },
      { id: 'gov_inclusion', indicator: 'Inclusive digital services', type: 'likert', prompt: 'Online services are accessible to people with disabilities and limited digital skills.', options: AGREE, tip: 'WCAG compliance and offline alternatives both matter.' },
      { id: 'gov_context', indicator: 'Government context', type: 'text', scored: false, prompt: 'Briefly: what is the biggest governance or capacity constraint?', tip: 'Optional. Not scored.', placeholder: 'e.g. no AI policy, procurement red tape, staff turnover…' },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    weight: 0.10,
    icon: 'signal',
    focus: 'Connectivity, devices, power',
    blurb: 'The physical and digital backbone AI depends on.',
    questions: [
      { id: 'inf_broadband', indicator: 'Broadband penetration', type: 'choice', prompt: 'What share of households have reliable broadband internet?', tip: 'Reliable means consistently usable for video and cloud apps.', options: [
        { label: 'Under 40%', v: 0 }, { label: '40–69%', v: 0.4 }, { label: '70–89%', v: 0.7 }, { label: '90%+', v: 1 } ] },
      { id: 'inf_mobile', indicator: 'Mobile / cellular coverage', type: 'likert', prompt: 'Reliable 4G/5G mobile data is available across the community.', options: MATURITY, tip: 'Mobile is often the primary on-ramp in underserved areas.' },
      { id: 'inf_devices', indicator: 'Device access per capita', type: 'choice', prompt: 'How widely do residents have access to a personal computing device?', tip: 'Smartphone-only access scores lower than full computing access.', options: [
        { label: 'Limited', v: 0 }, { label: 'Mostly smartphone-only', v: 0.4 }, { label: 'Broad device access', v: 0.7 }, { label: 'Near-universal', v: 1 } ] },
      { id: 'inf_power', indicator: 'Power reliability', type: 'likert', prompt: 'The electrical grid is reliable enough to support always-on digital services.', options: MATURITY, tip: 'Frequent outages undermine cloud and connectivity.' },
      { id: 'inf_cloud', indicator: 'Cloud infrastructure maturity', type: 'likert', prompt: 'Local institutions can access affordable cloud computing.', options: MATURITY, tip: 'Cloud lowers the barrier to deploying AI without owning hardware.' },
      { id: 'inf_affordability', indicator: 'Connectivity affordability', type: 'likert', prompt: 'Internet access is affordable for low-income households.', options: AGREE, tip: 'Affordability gaps drive the digital divide as much as coverage.' },
      { id: 'inf_public_access', indicator: 'Public access points', type: 'choice', prompt: 'How available are free public connectivity points (libraries, community centers, schools after hours)?', tip: 'Public access is a key equalizer where home broadband is thin.', options: [
        { label: 'None', v: 0 }, { label: 'A handful', v: 0.4 }, { label: 'Several, uneven coverage', v: 0.7 }, { label: 'Widespread and well-publicized', v: 1 } ] },
      { id: 'inf_resilience', indicator: 'Network resilience & redundancy', type: 'likert', prompt: 'Core connectivity has redundancy so a single failure will not take services offline.', options: MATURITY, tip: 'Redundant backhaul and backup power keep critical services available.' },
      { id: 'inf_resilience_followup', indicator: 'Backup provisioning', type: 'choice', prompt: 'When outages occur, what backup is typically in place for critical services?', dependsOn: { id: 'inf_resilience', whenAtMost: 0.5 }, tip: 'Adaptive follow-up shown when resilience is limited.', options: [
        { label: 'None', v: 0 }, { label: 'Ad-hoc / manual', v: 0.33 }, { label: 'Partial (some sites)', v: 0.66 }, { label: 'Standardized backup + failover', v: 1 } ] },
      { id: 'inf_context', indicator: 'Infrastructure context', type: 'text', scored: false, prompt: 'Briefly: where is the infrastructure gap most acute?', tip: 'Optional. Not scored.', placeholder: 'e.g. rural last-mile, affordability, grid stability…' },
    ],
  },
];

// Flat lookups -----------------------------------------------------------------
export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s]));

export const ALL_QUESTIONS = SECTORS.flatMap((s) =>
  s.questions.map((q) => ({ ...q, sectorId: s.id, sectorName: s.name }))
);

export const SCORED_QUESTION_COUNT = ALL_QUESTIONS.filter((q) => q.scored !== false && !q.dependsOn).length;

export function tierFor(score) {
  return [...TIERS].reverse().find((t) => score >= t.min) || TIERS[0];
}
