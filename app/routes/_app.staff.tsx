import { Form, Link, useFetcher, useNavigation, useOutletContext } from "react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import type { Route } from "./+types/_app.staff";
import { GravityLogo } from "~/components/GravityLogo";
import { staffSchema, parseErrors, type FieldErrors } from "~/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffMember = {
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
  createdAt: string;
};

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const [staffRes, gymRes] = await Promise.all([
    api.get<{ data: StaffMember[] }>("/api/staff", token),
    api.get<{ data: { qrToken: string; gymName: string } }>("/api/gym-profile", token),
  ]);

  const origin = new URL(request.url).origin;
  const staffApplyUrl = gymRes.data?.qrToken ? `${origin}/staff-apply/${gymRes.data.qrToken}` : null;
  const gymName = gymRes.data?.gymName ?? "";

  return { staff: staffRes.success ? staffRes.data : [], staffApplyUrl, gymName };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const form = await request.formData();
  const intent = form.get("intent") as string;

  if (intent === "delete") {
    const id = form.get("id") as string;
    const res = await api.delete(`/api/staff/${id}`, token);
    return { intent: "delete", success: res.success, error: res.success ? null : res.message };
  }

  if (intent === "create") {
    const raw: Record<string, unknown> = {};
    for (const [k, v] of form.entries()) {
      if (k === "intent") continue;
      if (k === "workingDays[]") {
        if (!Array.isArray(raw.workingDays)) raw.workingDays = [];
        (raw.workingDays as string[]).push(v as string);
      } else if (k === "specialization[]") {
        if (!Array.isArray(raw.specialization)) raw.specialization = [];
        (raw.specialization as string[]).push(v as string);
      } else {
        raw[k] = v;
      }
    }

    const parsed = staffSchema.safeParse(raw);
    if (!parsed.success) {
      return { intent: "create", success: false, fields: parseErrors(parsed.error) as FieldErrors, error: null, credentials: null };
    }

    const res = await api.post<{ data: StaffMember; credentials?: { email: string; password: string } | null }>("/api/staff", { ...parsed.data, workingDays: raw.workingDays, specialization: raw.specialization }, token);
    return { intent: "create", success: res.success, fields: null, error: res.success ? null : res.message, credentials: res.success ? (res.credentials ?? null) : null };
  }

  if (intent === "revoke") {
    const id = form.get("id") as string;
    const res = await api.delete(`/api/staff/${id}/account`, token);
    return { intent: "revoke", success: res.success, error: res.success ? null : res.message };
  }

  return { intent, success: false, error: "Unknown intent." };
}

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  trainer:      { label: "Trainer",      color: "text-primary",    bg: "bg-primary/10", dot: "bg-primary"    },
  receptionist: { label: "Receptionist", color: "text-blue-700",   bg: "bg-blue-50",    dot: "bg-blue-400"   },
  manager:      { label: "Manager",      color: "text-purple-700", bg: "bg-purple-50",  dot: "bg-purple-400" },
  cleaner:      { label: "Cleaner",      color: "text-teal-700",   bg: "bg-teal-50",    dot: "bg-teal-400"   },
};

const SHIFT_LABEL: Record<string, string> = {
  morning: "Morning",
  evening: "Evening",
  custom:  "Custom",
};

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_VAL   = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const SPECIALIZATIONS = ["Strength", "Cardio", "Yoga", "CrossFit", "Zumba", "HIIT"];

const ROLES_WITH_PORTAL = ["trainer", "manager", "receptionist"] as const;

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls  = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";
const selectCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function Section({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_CAL = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function DatePicker({ name, max, min, placeholder = "Pick a date" }: {
  name: string; max?: string; min?: string; placeholder?: string;
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [open,      setOpen]      = useState(false);
  const [selected,  setSelected]  = useState<Date | null>(null);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const displayVal = selected
    ? selected.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const maxDate = max ? new Date(max) : null;
  const minDate = min ? new Date(min) : null;

  const cells = useMemo(() => {
    const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays    = new Date(viewYear, viewMonth, 0).getDate();
    const arr: { date: Date; cur: boolean }[] = [];
    for (let i = firstDow - 1; i >= 0; i--)
      arr.push({ date: new Date(viewYear, viewMonth - 1, prevDays - i), cur: false });
    for (let d = 1; d <= daysInMonth; d++)
      arr.push({ date: new Date(viewYear, viewMonth, d), cur: true });
    while (arr.length < 42)
      arr.push({ date: new Date(viewYear, viewMonth + 1, arr.length - firstDow - daysInMonth + 1), cur: false });
    return arr;
  }, [viewYear, viewMonth]);

  const isSel = (d: Date) => !!selected && d.toDateString() === selected.toDateString();
  const isTod = (d: Date) => d.toDateString() === today.toDateString();
  const isDis = (d: Date) => !!(maxDate && d > maxDate) || !!(minDate && d < minDate);

  const prevMo = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1);
  const nextMo = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y+1)) : setViewMonth(m => m+1);
  const pick   = (d: Date) => { if (!isDis(d)) { setSelected(d); setOpen(false); } };

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={selected ? toIso(selected) : ""} />
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition flex items-center justify-between gap-2"
        style={{ color: selected ? "#111827" : "#9ca3af" }}
      >
        <span>{displayVal || placeholder}</span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 select-none"
          style={{ animation: "staffPop 0.15s cubic-bezier(.34,1.56,.64,1) both" }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMo} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold text-gray-900">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMo} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAYS_CAL.map(d => <span key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ date, cur }, i) => {
              const sel = isSel(date); const tod = isTod(date); const dis = isDis(date);
              return (
                <button key={i} type="button" onClick={() => pick(date)} disabled={dis}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition ${
                    sel  ? "text-primary-foreground"
                    : tod ? "text-primary font-bold"
                    : cur ? "text-gray-800 hover:bg-primary/10"
                    :       "text-gray-300 hover:bg-gray-50"
                  } ${dis ? "opacity-30 cursor-not-allowed" : ""}`}
                  style={sel ? { background: "var(--primary)" } : {}}>
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <button type="button" onClick={() => setSelected(null)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition">Clear</button>
            <button type="button" onClick={() => { if (!isDis(today)) { setSelected(today); setOpen(false); } }}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition">Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "staffPop 0.18s cubic-bezier(.34,1.56,.64,1) both" }}>
        <div className="flex flex-col items-center px-6 pt-7 pb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)" }}>
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 text-center">{title}</h2>
          <p className="text-sm text-gray-500 text-center mt-1.5 leading-relaxed">{message}</p>
        </div>
        <div className="h-px bg-gray-100 mx-6" />
        <div className="flex items-center gap-3 px-6 py-4">
          <button type="button" onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            Cancel
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

function AddStaffModal({ open, onClose, isSubmitting, error, fields }: {
  open: boolean; onClose: () => void; isSubmitting: boolean;
  error?: string | null; fields?: FieldErrors | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [role,             setRole]           = useState("trainer");
  const [specializations, setSpecs]           = useState<string[]>([]);
  const [workingDays,      setWorkingDays]     = useState<string[]>(["mon","tue","wed","thu","fri"]);
  const [shiftType,        setShiftType]       = useState("morning");
  const [salaryType,       setSalaryType]      = useState("monthly");
  const [employmentType,   setEmploymentType]  = useState("full-time");
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleSpec = (s: string) =>
    setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleDay = (d: string) =>
    setWorkingDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh", animation: "staffPop 0.2s cubic-bezier(.34,1.56,.64,1) both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the staff profile details</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}
          <Form method="post" id="add-staff-form" className="space-y-5">
            <input type="hidden" name="intent" value="create" />

            {/* Hidden array inputs */}
            {workingDays.map(d => <input key={d} type="hidden" name="workingDays[]" value={d} />)}
            {specializations.map(s => <input key={s} type="hidden" name="specialization[]" value={s} />)}
            <input type="hidden" name="shiftType" value={shiftType} />
            <input type="hidden" name="salaryType" value={salaryType} />
            <input type="hidden" name="employmentType" value={employmentType} />

            {/* ── Personal Info ── */}
            <Section title="Personal Info" icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name <span className="text-red-500">*</span></Label>
                <input name="firstName" type="text" placeholder="Arjun" className={`${inputCls} ${fields?.firstName ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.firstName} />
              </div>
              <div>
                <Label>Last name <span className="text-red-500">*</span></Label>
                <input name="lastName" type="text" placeholder="Sharma" className={`${inputCls} ${fields?.lastName ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.lastName} />
              </div>
              <div>
                <Label>Phone <span className="text-red-500">*</span></Label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" className={`${inputCls} ${fields?.phone ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.phone} />
              </div>
              <div>
                <Label>
                  Email{" "}
                  {ROLES_WITH_PORTAL.includes(role as any)
                    ? <span className="text-red-500">*</span>
                    : <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  }
                </Label>
                <input
                  name="email" type="text" placeholder="arjun@gym.com"
                  className={`${inputCls} ${fields?.email ? "border-red-400!" : ""}`}
                />
                {ROLES_WITH_PORTAL.includes(role as any) && !fields?.email && (
                  <p className="mt-1 text-xs text-primary font-medium">Required to create a portal login account</p>
                )}
                <FieldError msg={fields?.email} />
              </div>
              <div>
                <Label>Gender <span className="text-red-500">*</span></Label>
                <select name="gender" className={`${selectCls} ${fields?.gender ? "border-red-400!" : ""}`}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <FieldError msg={fields?.gender} />
              </div>
              <div>
                <Label>Date of birth</Label>
                <DatePicker name="dateOfBirth" max={todayIso} placeholder="Pick DOB" />
              </div>
            </div>

            {/* ── Role & Job ── */}
            <Section title="Role & Job Details" icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            } />

            {/* Role pills */}
            <div>
              <Label>Role <span className="text-red-500">*</span></Label>
              <input type="hidden" name="role" value={role} />
              <FieldError msg={fields?.role} />
              <div className="flex flex-wrap gap-2">
                {(["trainer","receptionist","manager","cleaner"] as const).map(r => {
                  const cfg = ROLE_CONFIG[r];
                  const active = role === r;
                  return (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        active
                          ? `${cfg.bg} ${cfg.color} border-current`
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialization — trainer only */}
            {role === "trainer" && (
              <div>
                <Label>Specialization</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(s => {
                    const active = specializations.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSpec(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition ${
                          active
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}>
                        {active && <span className="mr-1">✓</span>}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Joining date <span className="text-red-500">*</span></Label>
                <DatePicker name="joiningDate" placeholder="Pick joining date" />
                <FieldError msg={fields?.joiningDate} />
              </div>
              <div>
                <Label>Employment type</Label>
                <div className="flex gap-2 mt-0.5">
                  {(["full-time","part-time"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setEmploymentType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                        employmentType === t
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}>
                      {t === "full-time" ? "Full-time" : "Part-time"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Salary */}
            <div>
              <Label>Salary</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                  <input name="salaryAmount" type="number" min={0} placeholder="25000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition" />
                </div>
                <div className="flex gap-1.5">
                  {(["monthly","per-session"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setSalaryType(t)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap ${
                        salaryType === t
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}>
                      {t === "monthly" ? "/ month" : "/ session"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Work Schedule ── */}
            <Section title="Work Schedule" icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } />

            {/* Working days */}
            <div>
              <Label>Working days</Label>
              <div className="flex gap-1.5">
                {DAYS_VAL.map((d, i) => {
                  const active = workingDays.includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}>
                      {DAYS_SHORT[i]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shift timing */}
            <div>
              <Label>Shift timing</Label>
              <div className="flex gap-2">
                {(["morning","evening","custom"] as const).map(s => (
                  <button key={s} type="button" onClick={() => setShiftType(s)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition flex items-center justify-center gap-1.5 ${
                      shiftType === s
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}>
                    <span>{s === "morning" ? "🌅" : s === "evening" ? "🌇" : "⏱️"}</span>
                    <span>{SHIFT_LABEL[s]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom time inputs */}
            {shiftType === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Shift start</Label>
                  <input name="shiftStart" type="time" className={inputCls} />
                </div>
                <div>
                  <Label>Shift end</Label>
                  <input name="shiftEnd" type="time" className={inputCls} />
                </div>
              </div>
            )}

          </Form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            Cancel
          </button>
          <button
            type="submit"
            form="add-staff-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition disabled:opacity-60"
          >
            {isSubmitting ? "Adding…" : "Add Staff Member"}
          </button>
        </div>
      </div>

      <style>{`@keyframes staffPop{from{opacity:0;transform:scale(.9) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─── Join QR Modal ────────────────────────────────────────────────────────────

function JoinQRModal({ open, joinUrl, gymName, onClose }: {
  open: boolean;
  joinUrl: string | null;
  gymName: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !canvasRef.current || !joinUrl) return;
    import("qrcode").then(QRCode =>
      QRCode.toCanvas(canvasRef.current!, joinUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#1e293b", light: "#fff7ed" },
      })
    );
  }, [open, joinUrl]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const copyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${gymName.replace(/\s+/g, "-")}-join-qr.png`;
    a.click();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "staffPop 0.18s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Staff Application QR</h2>
            <p className="text-xs text-gray-400 mt-0.5">Scan to apply for a staff position</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-6 gap-4">
          {joinUrl ? (
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
              <canvas ref={canvasRef} />
            </div>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 w-[232px] h-[232px] flex items-center justify-center">
              <p className="text-xs text-center text-gray-400">Complete gym onboarding to generate a join QR.</p>
            </div>
          )}
          <div className="w-full text-center">
            <p className="text-sm font-semibold text-gray-700">{gymName || "Your Gym"}</p>
            <p className="text-xs text-gray-400 mt-0.5 break-all">{joinUrl ?? "—"}</p>
          </div>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={copyLink}
              disabled={!joinUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-600 disabled:opacity-40"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
            <button
              type="button"
              onClick={downloadQr}
              disabled={!joinUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })}
      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
        copied
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
      } ${className ?? ""}`}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Credentials Modal ────────────────────────────────────────────────────────

function CredentialsModal({ credentials, onClose }: {
  credentials: { email: string; password: string };
  onClose: () => void;
}) {

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "staffPop 0.18s cubic-bezier(.34,1.56,.64,1) both" }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Portal access created</h2>
              <p className="text-xs text-gray-400 mt-0.5">Staff login credentials</p>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl flex items-start gap-2.5 text-xs"
          style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>Save this password now — it won't be shown again.</span>
        </div>

        {/* Credentials */}
        <div className="px-6 py-4 space-y-3">
          {/* Email */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 truncate">
                {credentials.email}
              </code>
              <CopyButton text={credentials.email} />
            </div>
          </div>

          {/* Password */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Temporary password</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 truncate">
                {credentials.password}
              </code>
              <CopyButton text={credentials.password} />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-6" />
        <div className="px-6 py-4">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Staff({ loaderData, actionData }: Route.ComponentProps) {
  const { staff, staffApplyUrl, gymName } = loaderData;
  const { role } = useOutletContext<{ role: string; staffRole: string }>();
  const isAdmin = role === "admin";
  const navigation   = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const deleteFetcher = useFetcher();

  const revokeFetcher = useFetcher();

  const [showModal,      setShowModal]      = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState<{ id: string; name: string } | null>(null);
  const [confirmRevoke,  setConfirmRevoke]  = useState<{ id: string; name: string } | null>(null);
  const [credentials,    setCredentials]    = useState<{ email: string; password: string } | null>(null);
  const [showJoinQR,     setShowJoinQR]     = useState(false);
  const [search,         setSearch]         = useState("");
  const [roleFilter,     setRoleFilter]     = useState("all");

  // Close modal and show credentials on successful create
  useEffect(() => {
    const ad = actionData as any;
    if (ad?.intent === "create" && ad?.success) {
      setShowModal(false);
      if (ad.credentials) setCredentials(ad.credentials);
    }
  }, [actionData]);

  // Dismiss confirm on successful delete
  useEffect(() => {
    if ((deleteFetcher.data as any)?.success) setConfirmDelete(null);
  }, [deleteFetcher.data]);

  // Dismiss revoke confirm on success
  useEffect(() => {
    if ((revokeFetcher.data as any)?.success) setConfirmRevoke(null);
  }, [revokeFetcher.data]);

  const filtered = useMemo(() => {
    let list = staff;
    if (roleFilter !== "all") list = list.filter(s => s.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.staffId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [staff, search, roleFilter]);

  const counts = useMemo(() => {
    let trainers = 0, managers = 0, receptionists = 0, active = 0;
    for (const s of staff) {
      if (s.role === "trainer")      trainers++;
      if (s.role === "manager")      managers++;
      if (s.role === "receptionist") receptionists++;
      if (s.isActive)                active++;
    }
    return { trainers, managers, receptionists, active };
  }, [staff]);

  const createError = (actionData as any)?.intent === "create" ? (actionData as any)?.error : null;

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
          <h1 className="text-xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-400 mt-0.5">{staff.length} total · {counts.active} active</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJoinQR(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Staff QR
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Staff
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-5 pb-16">
        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { ...ROLE_CONFIG.trainer,      label: "Trainers",      value: counts.trainers      },
            { ...ROLE_CONFIG.manager,      label: "Managers",      value: counts.managers      },
            { ...ROLE_CONFIG.receptionist, label: "Receptionists", value: counts.receptionists },
            { label: "Active",        value: counts.active,        color: "text-emerald-700",  bg: "bg-emerald-50",  dot: "bg-emerald-400" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-current/10 p-5 flex items-center gap-4`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, staff ID…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-white transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            {/* Role filter pills */}
            <div className="flex gap-1.5">
              {[
                { value: "all",          label: "All roles"    },
                { value: "trainer",      label: "Trainers"     },
                { value: "receptionist", label: "Receptionists"},
                { value: "manager",      label: "Managers"     },
                { value: "cleaner",      label: "Cleaners"     },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => setRoleFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    roleFilter === opt.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                {staff.length === 0 ? "No staff added yet — click Add Staff to get started." : "No staff match your filters."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Login Access</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => {
                  const cfg = ROLE_CONFIG[s.role] ?? ROLE_CONFIG.trainer;
                  const initials = `${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`.toUpperCase();
                  const daysCount = s.schedule?.workingDays?.length ?? 0;
                  const shift = SHIFT_LABEL[s.schedule?.shiftType] ?? "—";
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/70 transition">
                      {/* Staff */}
                      <td className="px-5 py-4">
                        <Link to={`/staff/${s._id}`} className="flex items-center gap-3 group">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${cfg.bg} ${cfg.color}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">{s.staffId ?? "—"}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          {s.role === "trainer" && s.specialization?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-32">{s.specialization.join(" · ")}</p>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-gray-700">{s.phone}</p>
                        {s.email && <p className="text-xs text-gray-400 truncate max-w-36">{s.email}</p>}
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-4">
                        <p className="text-gray-700">{shift}</p>
                        <p className="text-xs text-gray-400">{daysCount} day{daysCount !== 1 ? "s" : ""}/week</p>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(s.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}>
                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Portal status */}
                      <td className="px-5 py-4">
                        {s.userId ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Has Login
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            No Login
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <>
                            {s.userId && (
                              <button
                                type="button"
                                onClick={() => setConfirmRevoke({ id: s._id, name: `${s.firstName} ${s.lastName}` })}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition"
                                title="Revoke portal access"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ id: s._id, name: `${s.firstName} ${s.lastName}` })}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                              title="Remove staff"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        open={showModal}
        onClose={() => setShowModal(false)}
        isSubmitting={isSubmitting}
        error={createError}
        fields={(actionData as any)?.intent === "create" ? (actionData as any)?.fields as FieldErrors | null : null}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove staff member?"
        message={`${confirmDelete?.name} will be permanently removed from your staff roster.`}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            const fd = new FormData();
            fd.append("intent", "delete");
            fd.append("id", confirmDelete.id);
            deleteFetcher.submit(fd, { method: "post" });
          }
        }}
      />

      {/* Revoke access confirmation */}
      <ConfirmDialog
        open={!!confirmRevoke}
        title="Revoke portal access?"
        message={`${confirmRevoke?.name}'s login account will be deleted. They won't be able to sign in anymore.`}
        onCancel={() => setConfirmRevoke(null)}
        onConfirm={() => {
          if (confirmRevoke) {
            const fd = new FormData();
            fd.append("intent", "revoke");
            fd.append("id", confirmRevoke.id);
            revokeFetcher.submit(fd, { method: "post" });
          }
        }}
      />

      {/* Credentials modal */}
      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}

      {/* QR modal */}
      <JoinQRModal open={showJoinQR} joinUrl={staffApplyUrl} gymName={gymName} onClose={() => setShowJoinQR(false)} />
    </div>
  );
}
