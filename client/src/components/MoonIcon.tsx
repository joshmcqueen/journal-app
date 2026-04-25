interface Props {
  phase: number;
  size?: number;
  variant?: 'icon' | 'ghost';
  className?: string;
}

function illuminatedPath(phase: number, R: number): string {
  const cx = R, cy = R;

  if (Math.abs(phase - 0.5) < 0.015) {
    return `M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} Z`;
  }

  const tx = R * Math.abs(Math.cos(phase * Math.PI * 2));

  if (phase < 0.5) {
    const sweep = phase > 0.25 ? 1 : 0;
    return `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${tx} ${R} 0 0 ${sweep} ${cx} ${cy - R} Z`;
  } else {
    const sweep = phase < 0.75 ? 0 : 1;
    return `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${tx} ${R} 0 0 ${sweep} ${cx} ${cy - R} Z`;
  }
}

export default function MoonIcon({ phase, size = 16, variant = 'icon', className }: Props) {
  const isNewMoon = phase < 0.015 || phase > 0.985;
  const R = size / 2;

  if (variant === 'ghost') {
    return (
      <svg
        className={className ?? 'calendar-moon-ghost'}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {!isNewMoon && (
          <path d={illuminatedPath(phase, R)} fill="white" />
        )}
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <circle cx={R} cy={R} r={R - 0.5} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.30)" strokeWidth={0.75} />
      {!isNewMoon && (
        <path d={illuminatedPath(phase, R)} fill="rgba(255,255,255,0.85)" />
      )}
    </svg>
  );
}
