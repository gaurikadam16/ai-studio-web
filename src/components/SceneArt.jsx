// Sample artwork shown while the app uses fake results (no backend yet).
export const SCENE_PALETTES = [
  { sky: '#1E2233', far: '#141725', ground: '#1A1D28', stall: '#2A2530', awning: '#B5563C', glow: '#FFC46B', moon: '#EDEAE4', moonX: 36, rain: '#9DB4E0', u1: '#3E6FD8', u2: '#D8A13E' },
  { sky: '#2A1F2E', far: '#1A1320', ground: '#221A26', stall: '#34262E', awning: '#2F7A6A', glow: '#FFB056', moon: '#F6D7B0', moonX: 200, rain: '#C6A8D8', u1: '#D2485A', u2: '#4AA3A0' },
  { sky: '#1B2A2C', far: '#10191B', ground: '#162224', stall: '#23302F', awning: '#C9913C', glow: '#FFD27A', moon: '#DDEFE8', moonX: 60, rain: '#A6D0CC', u1: '#E0703A', u2: '#5566D8' },
  { sky: '#2B2A3F', far: '#1A192A', ground: '#222134', stall: '#2E2B3E', awning: '#A0443E', glow: '#FFA95E', moon: '#E6E0FF', moonX: 180, rain: '#B8B2E6', u1: '#3FA36A', u2: '#D0487C' },
];

export function TeaStallScene({ p }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 240 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="240" height="210" fill={p.sky} />
      <circle cx={p.moonX} cy="34" r="12" fill={p.moon} opacity="0.55" />
      <path d="M0 120 V70 h26 v-18 h22 v30 h18 V58 h30 v62 z" fill={p.far} />
      <path d="M150 120 V64 h24 V44 h28 v34 h20 V60 h18 v60 z" fill={p.far} />
      <rect x="0" y="120" width="240" height="90" fill={p.ground} />
      <rect x="0" y="150" width="240" height="60" fill={p.glow} opacity="0.18" />
      <rect x="84" y="78" width="78" height="56" fill={p.stall} />
      <path d="M76 80 L170 80 L162 66 L84 66 Z" fill={p.awning} />
      <rect x="92" y="90" width="62" height="28" rx="2" fill={p.glow} />
      <circle cx="123" cy="104" r="40" fill={p.glow} opacity="0.14" />
      <rect x="96" y="112" width="8" height="8" rx="1" fill={p.stall} />
      <rect x="110" y="110" width="6" height="10" rx="1" fill={p.stall} />
      <rect x="84" y="134" width="78" height="4" fill={p.far} />
      <rect x="196" y="60" width="3" height="80" fill={p.far} />
      <circle cx="197" cy="60" r="5" fill={p.glow} />
      <circle cx="197" cy="60" r="22" fill={p.glow} opacity="0.18" />
      <path d="M30 140 a14 10 0 0 1 28 0 z" fill={p.u1} />
      <rect x="38" y="146" width="12" height="26" rx="5" fill={p.far} />
      <path d="M176 146 a13 9 0 0 1 26 0 z" fill={p.u2} />
      <rect x="183" y="151" width="12" height="24" rx="5" fill={p.far} />
      <g stroke={p.rain} strokeWidth="1" opacity="0.45" strokeLinecap="round">
        <path d="M12 10 l-4 12 M40 30 l-4 12 M70 8 l-4 12 M98 40 l-4 12 M130 16 l-4 12 M160 36 l-4 12 M188 12 l-4 12 M220 30 l-4 12 M24 60 l-4 12 M60 90 l-4 12 M140 50 l-4 12 M176 92 l-4 12 M214 70 l-4 12 M20 110 l-4 12 M230 110 l-4 12 M70 170 l-4 12 M120 160 l-4 12 M160 180 l-4 12 M216 170 l-4 12" />
      </g>
    </svg>
  );
}