// Minimal inline icon set (stroke-based, currentColor).
import React from 'react';

const wrap = (children, props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

export const Icon = {
  book: (p) => wrap(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" /></>, p),
  briefcase: (p) => wrap(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>, p),
  heart: (p) => wrap(<path d="M12 20s-7-4.6-7-9.7A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7 3.3C19 15.4 12 20 12 20z" />, p),
  building: (p) => wrap(<><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M10 21v-3h4v3" /></>, p),
  signal: (p) => wrap(<><path d="M5 19v-4M10 19v-8M15 19v-12M20 19V5" /></>, p),
  arrowRight: (p) => wrap(<path d="M5 12h14M13 6l6 6-6 6" />, p),
  arrowLeft: (p) => wrap(<path d="M19 12H5M11 6l-6 6 6 6" />, p),
  check: (p) => wrap(<path d="M5 12.5 10 17l9-10" />, p),
  download: (p) => wrap(<><path d="M12 3v12M7 11l5 4 5-4" /><path d="M5 21h14" /></>, p),
  refresh: (p) => wrap(<><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" /></>, p),
  info: (p) => wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, p),
  flag: (p) => wrap(<><path d="M5 21V4M5 4h11l-1.5 4L16 12H5" /></>, p),
  alert: (p) => wrap(<><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></>, p),
  spark: (p) => wrap(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />, p),
  target: (p) => wrap(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></>, p),
  layers: (p) => wrap(<><path d="M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 18l9 5 9-5" /></>, p),
  save: (p) => wrap(<><path d="M5 4h11l4 4v12H5z" /><path d="M8 4v5h7M8 20v-6h8v6" /></>, p),
  clock: (p) => wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, p),
  chart: (p) => wrap(<><path d="M4 4v16h16" /><path d="M8 14l3-3 2 2 4-5" /></>, p),
};

export function SectorIcon({ name, ...props }) {
  const fn = Icon[name] || Icon.layers;
  return fn(props);
}
