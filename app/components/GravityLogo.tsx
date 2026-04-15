/**
 * Gravity Gym — Brand logo
 *
 * Mark:  An orange/amber planet with:
 *        · Glowing gradient sphere (amber → orange)
 *        · Tilted Saturn-style ring revolving in 3D
 *        · Orbiting moon dot
 *        · Soft radial glow halo
 *
 * Type:  "GRAVITY" in orange gradient, "GYM" small-caps label below
 */

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  /** "dark"  — on dark backgrounds
   *  "light" — on light backgrounds */
  variant?: "light" | "dark";
  showText?: boolean;
  /** Prefix for gradient / clipPath IDs — must differ if rendered multiple times */
  id?: string;
};

const sizes = {
  sm: { icon: 28, title: 12,   sub: 7.5  },
  md: { icon: 36, title: 15.5, sub: 9.5  },
  lg: { icon: 44, title: 19,   sub: 11.5 },
  xl: { icon: 56, title: 24,   sub: 14.5 },
};

export function GravityLogo({
  size = "md",
  variant = "dark",
  showText = true,
  id = "gl",
}: Props) {
  const s       = sizes[size];
  const sId     = `${id}-sphere`;
  const rId     = `${id}-ring`;
  const glowId  = `${id}-glow`;
  const shId    = `${id}-shine`;
  const sh2Id   = `${id}-shine2`;
  const topId   = `${id}-top`;
  const botId   = `${id}-bot`;
  const moonId  = `${id}-moon`;

  const subColor = variant === "dark" ? "rgba(255,255,255,0.38)" : "#94a3b8";

  const ringAnim: React.CSSProperties = {
    transformBox:    "fill-box",
    transformOrigin: "center",
    animation:       "saturn-revolve 5s linear infinite",
  };

  const moonAnim: React.CSSProperties = {
    transformBox:    "fill-box",
    transformOrigin: "24px 24px",
    animation:       "moon-orbit 3s linear infinite",
  };

  const glowAnim: React.CSSProperties = {
    animation: "glow-pulse 3s ease-in-out infinite",
  };

  return (
    <div
        style={{
          display:    "inline-flex",
          alignItems: "center",
          gap:        Math.round(s.icon * 0.3),
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {/* ─────────────── Planet mark ─────────────── */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Sphere: amber → orange */}
            <radialGradient id={sId} cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#fcd34d" />
              <stop offset="45%"  stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </radialGradient>

            {/* Ring stroke: amber → orange-red */}
            <linearGradient id={rId} x1="2" y1="24" x2="46" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#fbbf24" />
              <stop offset="50%"  stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            {/* Outer glow halo */}
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#f97316" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0"    />
            </radialGradient>

            {/* Primary gloss highlight */}
            <radialGradient id={shId} cx="34%" cy="28%" r="50%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
            </radialGradient>

            {/* Secondary rim light (bottom-right) */}
            <radialGradient id={sh2Id} cx="70%" cy="72%" r="40%">
              <stop offset="0%"   stopColor="rgba(251,191,36,0.30)" />
              <stop offset="100%" stopColor="rgba(251,191,36,0)"    />
            </radialGradient>

            {/* Moon gradient */}
            <radialGradient id={moonId} cx="35%" cy="35%" r="65%">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </radialGradient>

            {/* Clip top half  → ring arc behind sphere */}
            <clipPath id={topId}>
              <rect x="0" y="0"  width="48" height="24" />
            </clipPath>

            {/* Clip bottom half → ring arc in front of sphere */}
            <clipPath id={botId}>
              <rect x="0" y="24" width="48" height="24" />
            </clipPath>
          </defs>

          {/* 0 · Glow halo — pulsing */}
          <circle cx="24" cy="24" r="18" fill={`url(#${glowId})`} style={glowAnim} />

          {/* 1 · Back ring arc — top half, dimmed */}
          <ellipse
            cx="24" cy="24" rx="21" ry="7"
            stroke={`url(#${rId})`} strokeWidth="2"
            clipPath={`url(#${topId})`}
            opacity="0.22"
            style={ringAnim}
          />

          {/* 2 · Sphere */}
          <circle cx="24" cy="24" r="13" fill={`url(#${sId})`} />

          {/* 3 · Gloss highlights */}
          <circle cx="24" cy="24" r="13" fill={`url(#${shId})`} />
          <circle cx="24" cy="24" r="13" fill={`url(#${sh2Id})`} />

          {/* 4 · Front ring arc — bottom half, full */}
          <ellipse
            cx="24" cy="24" rx="21" ry="7"
            stroke={`url(#${rId})`} strokeWidth="2.5"
            clipPath={`url(#${botId})`}
            strokeLinecap="round"
            style={ringAnim}
          />

          {/* 5 · Orbiting moon */}
          <g style={moonAnim}>
            <circle cx="24" cy="5" r="2.4" fill={`url(#${moonId})`} />
          </g>
        </svg>

        {/* ─────────────── Wordmark ─────────────── */}
        {showText && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* GRAVITY — orange gradient */}
            <span
              style={{
                fontFamily:           '"Plus Jakarta Sans", ui-sans-serif, sans-serif',
                fontWeight:           800,
                fontSize:             s.title,
                letterSpacing:        "0.07em",
                lineHeight:           1,
                background:           "linear-gradient(135deg, #f59e0b 0%, #f97316 55%, #ef4444 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}
            >
              GRAVITY
            </span>

            {/* GYM — subdued label */}
            <span
              style={{
                fontFamily:    '"Plus Jakarta Sans", ui-sans-serif, sans-serif',
                fontWeight:    600,
                fontSize:      s.sub,
                color:         subColor,
                letterSpacing: "0.30em",
                lineHeight:    1,
              }}
            >
              GYM
            </span>
          </div>
        )}
      </div>
  );
}
