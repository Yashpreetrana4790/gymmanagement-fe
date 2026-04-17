type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
  id?: string;
};

const sizes = {
  sm: { icon: 28, title: 13, sub: 8 },
  md: { icon: 36, title: 18, sub: 10 },
  lg: { icon: 44, title: 22, sub: 11 },
  xl: { icon: 56, title: 28, sub: 13 },
};

export function GravityLogo({
  size = "md",
  variant = "dark",
  showText = true,
  id = "gl",
}: Props) {
  const s = sizes[size];
  const D = (n: string) => `${id}-${n}`;

  const textPrimary   = variant === "dark" ? "#ffffff"             : "#0f172a";
  const textSecondary = variant === "dark" ? "rgba(255,255,255,0.42)" : "#64748b";
  const accentLine    = variant === "dark"
    ? "linear-gradient(to right, transparent, rgba(251,191,36,0.55))"
    : "linear-gradient(to right, transparent, rgba(234,88,12,0.45))";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>

      {/* ── ICON ── */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none">
        <defs>
          {/* Planet: warm highlight → deep burnt-orange */}
          <radialGradient id={D("planet")} cx="38%" cy="30%" r="68%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="38%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>

          {/* Specular: soft white sheen at top-left */}
          <radialGradient id={D("spec")} cx="34%" cy="26%" r="48%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.46)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
          </radialGradient>

          {/* Ring front (bottom half) — bright amber, fades at tips */}
          <linearGradient id={D("rf")} x1="3" y1="0" x2="45" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0"   />
            <stop offset="28%"  stopColor="#fbbf24" stopOpacity="0.95"/>
            <stop offset="50%"  stopColor="#fde68a"                    />
            <stop offset="72%"  stopColor="#fbbf24" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"   />
          </linearGradient>

          {/* Ring back (top half) — dimmer, shadow side */}
          <linearGradient id={D("rb")} x1="3" y1="0" x2="45" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#92400e" stopOpacity="0"   />
            <stop offset="50%"  stopColor="#d97706" stopOpacity="0.38"/>
            <stop offset="100%" stopColor="#92400e" stopOpacity="0"   />
          </linearGradient>

          {/* Clip: top half  → ring-behind-planet */}
          <clipPath id={D("cb")}>
            <rect x="0" y="0"  width="48" height="24" />
          </clipPath>

          {/* Clip: bottom half → ring-in-front-of-planet */}
          <clipPath id={D("cf")}>
            <rect x="0" y="24" width="48" height="24" />
          </clipPath>
        </defs>

        {/* Ambient glow behind everything */}
        <circle cx="24" cy="24" r="17" fill="#f97316" opacity="0.10" />

        {/* Ring — behind planet (top arc, dim) */}
        <ellipse
          cx="24" cy="24" rx="21" ry="6.5"
          stroke={`url(#${D("rb")})`}
          strokeWidth="2"
          clipPath={`url(#${D("cb")})`}
        />

        {/* Planet body */}
        <circle cx="24" cy="24" r="12" fill={`url(#${D("planet")})`} />

        {/* Specular highlight */}
        <circle cx="24" cy="24" r="12" fill={`url(#${D("spec")})`} />

        {/* Thin rim shadow at bottom of planet for grounding */}
        <circle
          cx="24" cy="24" r="12"
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1.2"
        />

        {/* Ring — in front of planet (bottom arc, bright) */}
        <ellipse
          cx="24" cy="24" rx="21" ry="6.5"
          stroke={`url(#${D("rf")})`}
          strokeWidth="2.8"
          clipPath={`url(#${D("cf")})`}
        />
      </svg>

      {/* ── TEXT ── */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>

          <span
            style={{
              fontWeight: 800,
              fontSize: s.title,
              letterSpacing: "0.09em",
              color: textPrimary,
              lineHeight: 1,
            }}
          >
            GRAVITY
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {/* Decorative accent line */}
            <div
              style={{
                height: 1,
                width: 16,
                background: accentLine,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontWeight: 500,
                fontSize: s.sub,
                letterSpacing: "0.32em",
                color: textSecondary,
                lineHeight: 1,
              }}
            >
              GYM
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
