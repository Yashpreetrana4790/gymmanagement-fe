import { Outlet, useLocation } from "react-router";
import { GravityLogo } from "~/components/GravityLogo";

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
    accentFrom: "#f59e0b",
    accentTo: "#f97316",
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
    accentFrom: "#f59e0b",
    accentTo: "#f97316",
  },
  "/verify": {
    image: "/register.png",
    badge: "Code sent · Valid for 10 minutes",
    headline: ["One Step", "Away."],
    sub: "We emailed you a 6-digit code. Enter it to unlock your Gravity Gym dashboard.",
    features: [
      { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Check your inbox & spam folder" },
      { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Code expires in 10 minutes" },
      { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "Tap resend if you need a new one" },
    ],
    accentFrom: "#f59e0b",
    accentTo: "#f97316",
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

      {/* Background particles (left side only) */}
      <div className="absolute inset-y-0 left-0 w-[52%] pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute rounded-full auth-particle"
            style={{
              width: `${[300, 400, 250, 350][i]}px`,
              height: `${[300, 400, 250, 350][i]}px`,
              top: `${[10, 60, 20, 70][i]}%`,
              left: `${[5, 55, 30, 10][i]}%`,
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
        <img src={panel.image} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-700" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,18,0.97) 0%, rgba(6,6,18,0.85) 55%, rgba(6,6,18,0.4) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,18,0.8) 0%, transparent 60%)" }} />

        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Logo */}
          <GravityLogo size="md" variant="dark" id="logo-left" />

          {/* Hero copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 text-xs font-semibold"
              style={{ background: `${panel.accentFrom}18`, border: `1px solid ${panel.accentFrom}35`, color: panel.accentFrom }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: panel.accentFrom }} />
              {panel.badge}
            </div>

            <h1 className="text-6xl font-black leading-none tracking-tight mb-4">
              <span className="text-white">{panel.headline[0]}</span><br />
              <span style={{ background: `linear-gradient(135deg, ${panel.accentFrom}, ${panel.accentTo})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {panel.headline[1]}
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs mb-8">{panel.sub}</p>

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

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>© {new Date().getFullYear()} Gravity Gym. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT: Form panel ─────────────────── */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-10 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #fafafa 0%, #fff7ed 50%, #fef3c7 100%)" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #fed7aa 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          opacity: 0.55,
        }} />

        {/* Ambient blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(251,146,60,0.13) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.70) 0%, transparent 65%)" }} />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <GravityLogo size="md" variant="light" id="logo-mobile" />
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-8"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(249,115,22,0.08), 0 0 0 1px rgba(249,115,22,0.08)" }}>
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

        .auth-input {
          display: block;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: #94a3b8; }
        .auth-input:hover:not(:focus) { border-color: #cbd5e1 !important; }
        .auth-input:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15), 0 0 0 1px #f97316 !important;
          background: #fff !important;
        }
      `}</style>
    </div>
  );
}
