import { Link, useNavigate, useOutletContext } from "react-router";
import type { Route } from "./+types/_app.staff.$id";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffDetail = {
  _id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  gender: string;
  dateOfBirth?: string;
  role: "trainer" | "receptionist" | "manager" | "cleaner";
  specialization: string[];
  joiningDate: string;
  salary: { amount?: number; type: "monthly" | "per-session" };
  employmentType: "full-time" | "part-time";
  schedule: {
    workingDays: string[];
    shiftType: "morning" | "evening" | "custom";
    shiftStart?: string;
    shiftEnd?: string;
  };
  isActive: boolean;
  userId?: string | null;
  tempPassword?: string | null;
  createdAt: string;
};

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const [staffRes, gymRes] = await Promise.all([
    api.get<{ data: StaffDetail }>(`/api/staff/${params.id}`, token),
    api.get<{ data: { qrToken: string; gymName: string } }>("/api/gym-profile", token),
  ]);

  if (!staffRes.success || !staffRes.data) throw new Response("Staff member not found", { status: 404 });

  const origin = new URL(request.url).origin;
  const staffApplyUrl = gymRes.data?.qrToken ? `${origin}/staff-apply/${gymRes.data.qrToken}` : null;
  const gymName = gymRes.data?.gymName ?? "";

  const QRCode = await import("qrcode");
  const qrDataUrl = staffApplyUrl
    ? await QRCode.toDataURL(staffApplyUrl, { width: 200, margin: 2, color: { dark: "#1e293b", light: "#fff7ed" } })
    : null;

  return { staff: staffRes.data, qrDataUrl, staffApplyUrl, gymName };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  trainer:      { label: "Trainer",      color: "#f97316", lightBg: "#fff7ed", lightText: "#c2410c", bannerA: "#fed7aa", bannerB: "#fb923c" },
  receptionist: { label: "Receptionist", color: "#3b82f6", lightBg: "#eff6ff", lightText: "#1d4ed8", bannerA: "#bfdbfe", bannerB: "#60a5fa" },
  manager:      { label: "Manager",      color: "#a855f7", lightBg: "#faf5ff", lightText: "#7e22ce", bannerA: "#e9d5ff", bannerB: "#c084fc" },
  cleaner:      { label: "Cleaner",      color: "#14b8a6", lightBg: "#f0fdfa", lightText: "#0f766e", bannerA: "#99f6e4", bannerB: "#2dd4bf" },
} as const;

const DAYS_ALL   = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const DAYS_LABEL: Record<string, string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };
const ROLES_WITH_PORTAL = ["trainer", "manager", "receptionist"];

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200">
        <span className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right flex-1">{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${
        copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
      }`}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

import React from "react";

export default function StaffDetail({ loaderData }: Route.ComponentProps) {
  const { staff: s, qrDataUrl, staffApplyUrl, gymName } = loaderData;
  const { role } = useOutletContext<{ role: string; staffRole: string }>();
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  const cfg = ROLE_CONFIG[s.role] ?? ROLE_CONFIG.trainer;
  const initials = `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();
  const hasPortal = ROLES_WITH_PORTAL.includes(s.role);
  const workingDays = s.schedule?.workingDays ?? [];

  const fmtDate = (iso?: string) => iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const shiftLabel =
    s.schedule?.shiftType === "morning" ? "Morning shift"
    : s.schedule?.shiftType === "evening" ? "Evening shift"
    : s.schedule?.shiftStart ? `${s.schedule.shiftStart}–${s.schedule.shiftEnd}` : "Custom shift";

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-800 font-medium truncate capitalize">{s.firstName} {s.lastName}</span>
          </div>
          <Link to="/staff" className="text-xs font-medium text-gray-500 hover:text-primary transition shrink-0">
            All staff
          </Link>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 pb-16">

        {/* Credentials banner */}
        {isAdmin && hasPortal && s.tempPassword && (
          <div className="rounded-2xl border border-amber-200 overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-200">
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="text-sm font-bold text-amber-800 flex-1">Pending first login — save these credentials now</span>
              <span className="text-xs text-amber-500">Disappears once staff signs in</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Login Email</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-mono text-gray-800 truncate shadow-sm">{s.email}</code>
                  <CopyButton text={s.email ?? ""} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Temporary Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-mono text-gray-800 truncate shadow-sm">{s.tempPassword}</code>
                  <CopyButton text={s.tempPassword} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile hero card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Gradient banner */}
          <div
            className="h-28 sm:h-32 w-full relative"
            style={{ background: `linear-gradient(135deg, ${cfg.bannerA} 0%, ${cfg.bannerB} 100%)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent" />
          </div>

          <div className="px-6 sm:px-8 pb-8 -mt-10 relative">
            {/* Avatar + badges */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-3xl font-black select-none shrink-0"
                style={{ background: `linear-gradient(135deg,${cfg.bannerA},${cfg.bannerB})`, color: cfg.lightText }}>
                {initials}
              </div>
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                }`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold border capitalize"
                  style={{ background: cfg.lightBg, color: cfg.lightText, borderColor: cfg.color + "33" }}>
                  {cfg.label}
                </span>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">{s.firstName} {s.lastName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{s.email ?? s.phone}</p>

            {/* Quick stats */}
            <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Staff ID",    value: <span className="font-mono">{s.staffId ?? "—"}</span> },
                { label: "Joined",      value: fmtDate(s.joiningDate) },
                { label: "Employment",  value: <span className="capitalize">{s.employmentType}</span> },
                { label: "Shift",       value: shiftLabel },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-sm font-bold mt-1 text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Contact */}
          <Card title="Contact Info" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }>
            <Row label="Phone"   value={s.phone} />
            <Row label="Email"   value={s.email} />
            <Row label="Gender"  value={<span className="capitalize">{s.gender}</span>} />
            <Row label="Birthday" value={fmtDate(s.dateOfBirth)} />
          </Card>

          {/* Work schedule */}
          <Card title="Work Schedule" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }>
            <Row label="Shift"      value={shiftLabel} />
            <Row label="Employment" value={<span className="capitalize">{s.employmentType}</span>} />
            <Row label="Joined"     value={fmtDate(s.joiningDate)} />
            <div className="pt-3 mt-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2.5">Working days</p>
              <div className="flex gap-1.5">
                {DAYS_ALL.map(d => {
                  const active = workingDays.includes(d);
                  return (
                    <div
                      key={d}
                      className={`flex-1 py-2 rounded-lg text-center border transition ${
                        active
                          ? "bg-primary border-primary"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span className={`text-xs font-bold ${active ? "text-white" : "text-gray-500"}`}>{DAYS_LABEL[d]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Role & salary */}
          <Card title="Role & Salary" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }>
            <Row label="Role" value={
              <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: cfg.lightBg, color: cfg.lightText }}>
                {cfg.label}
              </span>
            } />
            {s.salary?.amount ? (
              <Row label="Salary" value={`₹${s.salary.amount.toLocaleString("en-IN")} / ${s.salary.type === "monthly" ? "month" : "session"}`} />
            ) : null}
            {s.role === "trainer" && s.specialization?.length > 0 && (
              <div className="pt-3 mt-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2.5">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.specialization.map(sp => (
                    <span key={sp} className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{sp}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Portal access */}
          {isAdmin && hasPortal && (
            <Card title="Portal Access" icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            }>
              {s.userId && !s.tempPassword ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700">Active — staff has signed in</span>
                </div>
              ) : s.tempPassword ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-700">Pending first login</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
                  <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-xs font-semibold text-gray-500">No account created</span>
                </div>
              )}
            </Card>
          )}

          {/* QR code */}
          <Card title="Staff Application QR" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          }>
            {qrDataUrl ? (
              <div className="flex items-center gap-5">
                <div className="p-2.5 rounded-xl border-2 border-primary/20 bg-primary/5 shrink-0">
                  <img src={qrDataUrl} alt="Staff application QR" className="w-24 h-24" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Scan to apply as staff</p>
                  <p className="text-sm font-semibold text-gray-800">{gymName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 break-all truncate">{staffApplyUrl}</p>
                  <a
                    href={qrDataUrl}
                    download={`${gymName.replace(/\s+/g, "-")}-staff-apply-qr.png`}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-2">Complete gym onboarding to generate a join QR.</p>
            )}
          </Card>

        </div>

        {/* Back link */}
        <div className="pt-2">
          <Link to="/staff"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to staff
          </Link>
        </div>

      </div>
    </div>
  );
}
