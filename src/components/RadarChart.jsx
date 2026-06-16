import React, { useEffect, useState } from 'react';

// The signature element: a precision "readiness instrument". Concentric tier
// rings, labelled spokes per sector, an animated data polygon, and vertices
// that read each sector score. Pure SVG, themable, reduced-motion aware.
export default function RadarChart({ sectors, size = 360 }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setT(1);
    let raf;
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setT(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sectors]);

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const n = sectors.length;
  const ang = (i) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];

  const ringTiers = [
    { r: 0.4, hex: '#E07A45' },
    { r: 0.6, hex: '#E0B341' },
    { r: 0.8, hex: '#3FA66B' },
    { r: 1.0, hex: '#1F8A70' },
  ];

  const dataPts = sectors.map((s, i) => pt(i, (Math.max(2, s.score) / 100) * R * t));
  const polygon = dataPts.map((p) => p.join(',')).join(' ');

  const gridPoly = (r) =>
    Array.from({ length: n }, (_, i) => pt(i, R * r).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img"
      aria-label={`Radar chart of sector scores: ${sectors.map((s) => `${s.name} ${s.score}`).join(', ')}`}>
      {/* tier rings */}
      {ringTiers.map((ring, i) => (
        <polygon key={i} points={gridPoly(ring.r)} fill="none" stroke="#DCE3E9" strokeWidth="1" />
      ))}
      {ringTiers.map((ring, i) => (
        <circle key={`d${i}`} cx={cx + R * ring.r} cy={cy} r="2.4" fill={ring.hex} opacity="0.85" />
      ))}

      {/* spokes + labels */}
      {sectors.map((s, i) => {
        const [x, y] = pt(i, R);
        const [lx, ly] = pt(i, R + 26);
        const anchor = Math.abs(lx - cx) < 6 ? 'middle' : lx > cx ? 'start' : 'end';
        return (
          <g key={s.id}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#E4EAEF" strokeWidth="1" />
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
              fontSize="11.5" fontWeight="600" fill="#23323F" fontFamily="Inter, sans-serif">
              {s.name}
            </text>
            <text x={lx} y={ly + 14} textAnchor={anchor} dominantBaseline="middle"
              fontSize="10.5" fill="#647585" fontFamily="'IBM Plex Mono', monospace">
              {s.score}
            </text>
          </g>
        );
      })}

      {/* data polygon */}
      <polygon points={polygon} fill="#0EA5A4" fillOpacity="0.16" stroke="#0EA5A4" strokeWidth="2" strokeLinejoin="round" />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#0EA5A4" stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
