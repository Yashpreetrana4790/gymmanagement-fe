import { Outlet, useLocation } from "react-router";

type PanelConfig = {
  image: string;
  badge: string;
  headline: string[];
  sub: string;
  features: { icon: string; text: string }[];
  accentFrom: string;
  accentTo: string;
};

const panels: Record<string, PanelConfig> = {
  "/login": {
    image: "/register.png",
    badge: "Trusted by 50+ gyms worldwide",
    headline: ["Run Your", "Gym Empire."],
    sub: "Members, plans, payments — all in one powerful dashboard built for serious gym owners.",
    features: [
      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", text: "Smart member management" },
      { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", text: "Automated payment tracking" },
      { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Real-time analytics & reports" },
    ],
    accentFrom: "#6366f1",
    accentTo: "#06b6d4",
  },
  "/signup": {
    image: "/register.png",
    badge: "Free forever · No credit card",
    headline: ["Join 50+", "Gyms Today."],
    sub: "Set up your entire gym management system in under 5 minutes. No tech skills needed.",
    features: [
      { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Up & running in 5 minutes" },
      { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Bank-grade security" },
      { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", text: "24/7 dedicated support" },
    ],
    accentFrom: "#6366f1",
    accentTo: "#06b6d4",
  },
  "/verify": {
    image: "/otp.png",
    badge: "Almost there — one last step",
    headline: ["Verify &", "Unlock Access."],
    sub: "Your 6-digit code has been sent. It only takes a second to confirm your identity.",
    features: [
      { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Check your email inbox" },
      { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Code valid for 10 minutes" },
      { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "Request a new code anytime" },
    ],
    accentFrom: "#6366f1",
    accentTo: "#06b6d4",
  },
  "/onboarding": {
    image: "/companyprofile.png",
    badge: "Step 3 of 3 — Final step",
    headline: ["Almost", "There!"],
    sub: "Your account is verified. Now set up your gym profile and start managing like a pro.",
    features: [
      { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", text: "Set your gym's identity" },
      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", text: "Start onboarding members" },
      { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Dashboard ready instantly" },
    ],
    accentFrom: "#f59e0b",
    accentTo: "#f97316",
  },
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const panel = panels[pathname] ?? panels["/login"];
  const isOnboarding = pathname === "/onboarding";

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060612 0%, #0a0a20 50%, #060612 100%)" }}>

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full auth-particle"
            style={{
              width: `${[300,400,250,350,200,320][i]}px`,
              height: `${[300,400,250,350,200,320][i]}px`,
              top: `${[10,60,20,70,40,5][i]}%`,
              left: `${[5,70,40,10,80,55][i]}%`,
              background: i % 2 === 0
                ? `radial-gradient(circle, ${panel.accentFrom}18 0%, transparent 70%)`
                : `radial-gradient(circle, ${panel.accentTo}12 0%, transparent 70%)`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i * 2}s`,
            }} />
        ))}
      </div>

      {/* ── LEFT: Brand panel ─────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">
        {/* Gym image */}
        <img src={panel.image} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-700" />
        {/* Layered overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,18,0.97) 0%, rgba(6,6,18,0.85) 55%, rgba(6,6,18,0.4) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,18,0.8) 0%, transparent 60%)" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${panel.accentFrom}, ${panel.accentTo})`, boxShadow: `0 0 24px ${panel.accentFrom}50` }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              GYM<span style={{ color: panel.accentTo }}>+</span>CARE
            </span>
          </div>

          {/* Hero copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 text-xs font-semibold"
              style={{ background: `${panel.accentFrom}18`, border: `1px solid ${panel.accentFrom}35`, color: panel.accentFrom }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: panel.accentFrom }} />
              {panel.badge}
            </div>

            {/* Headline */}
            <h1 className="text-6xl font-black leading-none tracking-tight mb-4">
              <span className="text-white">{panel.headline[0]}</span><br />
              <span style={{ background: `linear-gradient(135deg, ${panel.accentFrom}, ${panel.accentTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {panel.headline[1]}
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs mb-8">{panel.sub}</p>

            {/* Features */}
            <div className="space-y-3">
              {panel.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${panel.accentFrom}15`, border: `1px solid ${panel.accentFrom}25` }}>
                    <svg className="w-4 h-4" style={{ color: panel.accentFrom }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Stats (only on login/signup) */}
            {!isOnboarding && pathname !== "/verify" && (
              <div className="flex gap-4 mt-8">
                {[{ v: "500+", l: "Members" }, { v: "50+", l: "Gyms" }, { v: "99.9%", l: "Uptime" }].map(s => (
                  <div key={s.l} className="flex-1 rounded-2xl px-4 py-3 text-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-xl font-black text-white">{s.v}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-slate-700 text-xs">© {new Date().getFullYear()} GymCare. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT: Form panel ─────────────────── */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-10">
        {/* Subtle right-side glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 60% 50%, ${panel.accentFrom}0a 0%, transparent 65%)` }} />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${panel.accentFrom}, ${panel.accentTo})`, boxShadow: `0 0 20px ${panel.accentFrom}50` }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-white text-base tracking-tight">
              GYM<span style={{ color: panel.accentTo }}>+</span>CARE
            </span>
          </div>

          {/* Glass card */}
          <div className="rounded-3xl p-8"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}>
            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${panel.accentFrom}80, ${panel.accentTo}60, transparent)` }} />

            <Outlet />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50%       { transform: translateY(-30px) scale(1.05); opacity: 1; }
        }
        .auth-particle { animation: floatOrb ease-in-out infinite; }

        .auth-input { display: block; }
        .auth-input::placeholder { color: rgba(100,116,139,0.5); }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.55) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 0 16px rgba(99,102,241,0.08) !important;
        }
        .auth-input:hover:not(:focus) { border-color: rgba(255,255,255,0.18) !important; }
      `}</style>
    </div>
  );
}
