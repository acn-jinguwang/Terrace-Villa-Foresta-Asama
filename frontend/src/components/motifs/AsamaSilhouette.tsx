interface Props {
  color?: string;
  opacity?: number;
  height?: number;
}

export function AsamaSilhouette({ color = 'currentColor', opacity = 0.08, height = 280 }: Props) {
  return (
    <svg
      viewBox="0 0 1440 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height }}
      aria-hidden="true"
    >
      <g fill={color} opacity={opacity}>
        {/* Asama main cone */}
        <path d="M720 20 L1020 260 L420 260 Z" />
        {/* Left ridge */}
        <path d="M420 260 L720 20 L540 260 Z" opacity="0.5" />
        {/* Right ridge */}
        <path d="M720 20 L1020 260 L860 260 Z" opacity="0.5" />
        {/* Foreground hills left */}
        <path d="M0 280 L240 140 L480 280 Z" />
        {/* Foreground hills right */}
        <path d="M960 280 L1200 120 L1440 280 Z" />
        {/* Mid hills */}
        <path d="M200 280 L380 180 L560 280 Z" opacity="0.6" />
        <path d="M880 280 L1060 160 L1240 280 Z" opacity="0.6" />
        {/* Base ground line */}
        <rect x="0" y="258" width="1440" height="22" opacity="0.3" />
      </g>
    </svg>
  );
}
