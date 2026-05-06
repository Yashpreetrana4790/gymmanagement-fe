import { Outlet, useLocation } from "react-router";
import { GravityLogo } from "~/components/GravityLogo";

type PanelConfig = {
  badge: string;
  headline: string[];
  sub: string;
  features: { icon: string; text: string }[];
};

const panels: Record<string, PanelConfig> = {
  "/login": {
    badge: "Trusted by 50+ gyms worldwide",
    headline: ["Run Your", "Gym Empire."],
    sub: "Members, plans, payments — all in one powerful dashboard built for serious gym owners.",
    features: [
      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", text: "Smart member management" },
      { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", text: "Automated payment tracking" },
      { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Real-time analytics & reports" },
    ],
  },
  "/signup": {
    badge: "Free forever · No credit card",
    headline: ["Join 50+", "Gyms Today."],
    sub: "Set up your entire gym management system in under 5 minutes. No tech skills needed.",
    features: [
      { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Up & running in 5 minutes" },
      { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Bank-grade security" },
      { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", text: "24/7 dedicated support" },
    ],
  },
  "/verify": {
    badge: "Code sent · Valid for 10 minutes",
    headline: ["One Step", "Away."],
    sub: "We emailed you a 6-digit code. Enter it to unlock your Gravity Gym dashboard.",
    features: [
      { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "Check your inbox & spam folder" },
      { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Code expires in 10 minutes" },
      { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "Tap resend if you need a new one" },
    ],
  },
  "/onboarding": {
    badge: "Step 3 of 3 — Final step",
    headline: ["Almost", "There!"],
    sub: "Your account is verified. Now set up your gym profile and start managing like a pro.",
    features: [
      { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", text: "Set your gym's identity" },
      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", text: "Start onboarding members" },
      { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", text: "Dashboard ready instantly" },
    ],
  },
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const panel = panels[pathname] ?? panels["/login"];
  const isOnboarding = pathname === "/onboarding";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">

        {/* ── LEFT: Brand panel ─────────────────── */}
        <div className="hidden lg:flex relative overflow-hidden bg-linear-to-br from-gray-950 via-gray-900 to-gray-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.14),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(249,115,22,0.18),transparent_35%)]" />

          <div className="relative z-10 flex flex-col h-full p-12 justify-between">
            <GravityLogo size="md" variant="dark" id="logo-left" />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 text-xs font-semibold bg-primary/15 border border-primary/30 text-primary">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block bg-primary" />
                {panel.badge}
              </div>

              <h1 className="text-6xl font-black leading-none tracking-tight mb-4 text-white">
                {panel.headline[0]}<br />
                <span className="text-primary">{panel.headline[1]}</span>
              </h1>
              <p className="text-gray-300 text-base leading-relaxed max-w-md mb-8">{panel.sub}</p>

              <div className="space-y-3">
                {panel.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10 text-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                      </svg>
                    </div>
                    <span className="text-gray-200 text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>

              {!isOnboarding && pathname !== "/verify" && (
                <div className="flex gap-4 mt-8">
                  {[{ v: "500+", l: "Members" }, { v: "50+", l: "Gyms" }, { v: "99.9%", l: "Uptime" }].map(s => (
                    <div key={s.l} className="flex-1 rounded-2xl px-4 py-3 text-center bg-white/5 border border-white/10">
                      <p className="text-xl font-black text-white">{s.v}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400">© {new Date().getFullYear()} Gravity Gym. All rights reserved.</p>
          </div>
        </div>

        {/* ── RIGHT: Form panel ─────────────────── */}
        <div className="flex items-center justify-center relative px-6 py-10 overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle,var(--primary)_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.08]" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <GravityLogo size="md" variant="light" id="logo-mobile" />
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
