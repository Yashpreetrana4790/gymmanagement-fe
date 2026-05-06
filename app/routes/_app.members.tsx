import { Form, Link, useNavigation, useFetcher } from "react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { memberSchema, parseErrors, type FieldErrors } from "~/lib/validations";
import type { Route } from "./+types/_app.members";

// ─── Types ────────────────────────────────────────────────────────────────────

type Member = {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
  };
  membershipType: "basic" | "standard" | "premium";
  membershipStart: string;
  membershipEnd: string;
  isActive: boolean;
  createdAt: string;
  physique?: { height?: number; weight?: number; bodyType?: string };
  diet?: { type?: string };
  goal?: { primary?: string };
};

type SortKey = "name" | "plan" | "expires" | "status" | "joined";
type SortDir = "asc" | "desc";

// ─── Loaders / Actions ───────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const origin = new URL(request.url).origin;
  const [membersResult, gymResult, plansResult] = await Promise.all([
    api.get<{ data: Member[]; count: number }>("/api/members", token),
    api.get<{ data: { qrToken: string; gymName: string } }>("/api/gym-profile", token),
    api.get<{ count: number }>("/api/plans", token),
  ]);
  const qrToken = gymResult.data?.qrToken ?? null;
  return {
    members: membersResult.data ?? [],
    joinUrl: qrToken ? `${origin}/join/${qrToken}` : null,
    gymName: gymResult.data?.gymName ?? "",
    hasPlans: (plansResult.count ?? 0) > 0,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    const raw = {
      firstName:         (form.get("firstName")         as string) ?? "",
      lastName:          (form.get("lastName")           as string) ?? "",
      email:             (form.get("email")              as string) ?? "",
      phone:             (form.get("phone")              as string) ?? "",
      dateOfBirth:       (form.get("dateOfBirth")        as string) ?? "",
      membershipType:    (form.get("membershipType")     as string) ?? "",
      membershipEnd:     (form.get("membershipEnd")      as string) ?? "",
      height:            (form.get("height")             as string) ?? "",
      weight:            (form.get("weight")             as string) ?? "",
      bodyType:          (form.get("bodyType")           as string) ?? "",
      dietType:          (form.get("dietType")           as string) ?? "",
      allergies:         (form.get("allergies")          as string) ?? "",
      supplements:       (form.get("supplements")        as string) ?? "",
      primaryGoal:       (form.get("primaryGoal")        as string) ?? "",
      targetWeight:      (form.get("targetWeight")       as string) ?? "",
      goalNotes:         (form.get("goalNotes")          as string) ?? "",
      medicalConditions: (form.get("medicalConditions")  as string) ?? "",
      injuries:          (form.get("injuries")           as string) ?? "",
      healthNotes:       (form.get("healthNotes")        as string) ?? "",
      emergencyName:     (form.get("emergencyName")      as string) ?? "",
      emergencyPhone:    (form.get("emergencyPhone")     as string) ?? "",
      emergencyRelation: (form.get("emergencyRelation")  as string) ?? "",
    };

    const parsed = memberSchema.safeParse(raw);
    if (!parsed.success) {
      return { intent: "create", success: false, fields: parseErrors(parsed.error) as FieldErrors, error: null };
    }

    const result = await api.post("/api/members", parsed.data, token);
    return {
      intent: "create",
      success: result.success,
      fields: null,
      error: result.success ? null : (result.message ?? "Failed to add member."),
    };
  }

  if (intent === "delete") {
    const id = form.get("id") as string;
    const result = await api.delete(`/api/members/${id}`, token);
    return { intent: "delete", success: result.success, error: result.success ? null : (result.message ?? "Failed to delete member.") };
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

const PLAN_BADGE: Record<string, string> = {
  premium:  "bg-amber-100 text-amber-700 border border-amber-200",
  standard: "bg-primary/10 text-primary border border-primary/20",
  basic:    "bg-gray-100 text-gray-600 border border-gray-200",
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition appearance-none";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 inline-flex flex-col gap-px transition-opacity ${active ? "opacity-100" : "opacity-25"}`}>
      <svg className={`w-2.5 h-2.5 ${active && dir === "asc" ? "text-primary" : "text-gray-400"}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L10 6H0z" />
      </svg>
      <svg className={`w-2.5 h-2.5 ${active && dir === "desc" ? "text-primary" : "text-gray-400"}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0 0H10z" />
      </svg>
    </span>
  );
}

function Section({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

// ─── Custom Select ────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value)!;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition whitespace-nowrap ${
          value !== options[0].value
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-300"
        }`}
      >
        {value !== options[0].value && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        )}
        {selected.label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 left-0 min-w-full bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 overflow-hidden"
          style={{ animation: "dialogPop 0.12s cubic-bezier(.34,1.56,.64,1) both" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition flex items-center gap-2.5 ${
                opt.value === value
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.value === value ? "bg-primary" : "bg-transparent"}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

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

  const isSel  = (d: Date) => !!selected && d.toDateString() === selected.toDateString();
  const isTod  = (d: Date) => d.toDateString() === today.toDateString();
  const isDis  = (d: Date) => !!(maxDate && d > maxDate) || !!(minDate && d < minDate);

  const prevMo = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1);
  const nextMo = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y+1)) : setViewMonth(m => m+1);

  const pick = (d: Date) => { if (!isDis(d)) { setSelected(d); setOpen(false); } };

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
        <div
          className="absolute z-50 mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 select-none"
          style={{ animation: "dialogPop 0.15s cubic-bezier(.34,1.56,.64,1) both" }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMo}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-900">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMo}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map(({ date, cur }, i) => {
              const sel = isSel(date);
              const tod = isTod(date);
              const dis = isDis(date);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={dis}
                  onClick={() => pick(date)}
                  className="h-8 w-full flex items-center justify-center rounded-xl text-xs transition-all"
                  style={{
                    background: sel ? "var(--primary)" : tod && !sel ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent",
                    color: sel ? "var(--primary-foreground)" : !cur || dis ? "#d1d5db" : tod ? "var(--primary)" : "#111827",
                    fontWeight: sel || tod ? 700 : 400,
                    cursor: dis ? "not-allowed" : "pointer",
                    outline: tod && !sel ? "1.5px solid color-mix(in oklch, var(--primary) 40%, transparent)" : "none",
                    outlineOffset: "-1.5px",
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button type="button"
              onClick={() => { setSelected(null); setOpen(false); }}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition">
              Clear
            </button>
            <button type="button"
              onClick={() => pick(today)}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition">
              Today
            </button>
          </div>

          <style>{`@keyframes dialogPop{from{opacity:0;transform:scale(.9) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
        </div>
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "dialogPop 0.18s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {/* Icon header */}
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

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogPop {
          from { opacity: 0; transform: scale(0.88) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────

function QrModal({ open, onClose, joinUrl, gymName }: {
  open: boolean; onClose: () => void; joinUrl: string; gymName: string;
}) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR into canvas whenever modal opens
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, joinUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#1e293b", light: "#fff7ed" },
      });
    });
  }, [open, joinUrl]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const copyLink = () => {
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
    a.download = `${gymName.replace(/\s+/g, "-")}-qr.png`;
    a.click();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "dialogPop 0.18s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Member Join QR</h2>
            <p className="text-xs text-gray-400 mt-0.5">Share to let members self-register</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-6 gap-4">
          <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
            <canvas ref={canvasRef} />
          </div>

          <div className="w-full text-center">
            <p className="text-sm font-semibold text-gray-700">{gymName}</p>
            <p className="text-xs text-gray-400 mt-0.5 break-all">{joinUrl}</p>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-600"
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground transition"
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

// ─── Add Member Modal ─────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

function AddMemberModal({ open, onClose, isSubmitting, error, fields }: {
  open: boolean; onClose: () => void; isSubmitting: boolean;
  error?: string | null; fields?: FieldErrors | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Member</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the member's profile details</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}
          <Form method="post" id="add-member-form" className="space-y-5">
            <input type="hidden" name="intent" value="create" />

            <Section title="Personal Info" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name <span className="text-red-500">*</span></Label>
                <input name="firstName" type="text" placeholder="John" className={`${inputCls} ${fields?.firstName ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.firstName} />
              </div>
              <div>
                <Label>Last name</Label>
                <input name="lastName" type="text" placeholder="Doe" className={inputCls} />
              </div>
              <div>
                <Label>Email <span className="text-red-500">*</span></Label>
                <input name="email" type="text" placeholder="john@example.com" className={`${inputCls} ${fields?.email ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.email} />
              </div>
              <div>
                <Label>Phone</Label>
                <input name="phone" type="tel" placeholder="+91 98765 43210" className={`${inputCls} ${fields?.phone ? "border-red-400!" : ""}`} />
                <FieldError msg={fields?.phone} />
              </div>
              <div><Label>Date of birth</Label><DatePicker name="dateOfBirth" max={todayIso} placeholder="Pick date of birth" /></div>
            </div>

            <Section title="Membership" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Plan <span className="text-red-500">*</span></Label>
                <select name="membershipType" className={`${selectCls} ${fields?.membershipType ? "border-red-400!" : ""}`}>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
                <FieldError msg={fields?.membershipType} />
              </div>
              <div>
                <Label>Expires on <span className="text-red-500">*</span></Label>
                <DatePicker name="membershipEnd" min={todayIso} placeholder="Pick expiry date" />
                <FieldError msg={fields?.membershipEnd} />
              </div>
            </div>

            <Section title="Body & Physique" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Height (cm)</Label><input name="height" type="number" min={50} max={250} placeholder="175" className={inputCls} /></div>
              <div><Label>Weight (kg)</Label><input name="weight" type="number" min={20} max={300} step={0.1} placeholder="70" className={inputCls} /></div>
              <div><Label>Body type</Label><select name="bodyType" className={selectCls}><option value="">Select…</option><option value="ectomorph">Ectomorph</option><option value="mesomorph">Mesomorph</option><option value="endomorph">Endomorph</option></select></div>
            </div>

            <Section title="Diet & Nutrition" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Diet type</Label><select name="dietType" className={selectCls}><option value="">Select…</option><option value="vegetarian">Vegetarian</option><option value="non-vegetarian">Non-Vegetarian</option><option value="vegan">Vegan</option><option value="eggetarian">Eggetarian</option></select></div>
              <div><Label>Supplements</Label><input name="supplements" type="text" placeholder="Whey, Creatine…" className={inputCls} /></div>
              <div className="col-span-2"><Label>Food allergies (comma-separated)</Label><input name="allergies" type="text" placeholder="nuts, dairy, gluten…" className={inputCls} /></div>
            </div>

            <Section title="Fitness Goal" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Primary goal</Label><select name="primaryGoal" className={selectCls}><option value="">Select…</option><option value="weight-loss">Weight Loss</option><option value="muscle-gain">Muscle Gain</option><option value="endurance">Endurance</option><option value="flexibility">Flexibility</option><option value="general-fitness">General Fitness</option><option value="rehabilitation">Rehabilitation</option></select></div>
              <div><Label>Target weight (kg)</Label><input name="targetWeight" type="number" min={20} max={300} step={0.1} placeholder="65" className={inputCls} /></div>
              <div className="col-span-2"><Label>Goal notes</Label><textarea name="goalNotes" rows={2} placeholder="Specific targets…" className={`${inputCls} resize-none`} /></div>
            </div>

            <Section title="Health & Medical" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
            <div className="grid grid-cols-1 gap-3">
              <div><Label>Medical conditions</Label><input name="medicalConditions" type="text" placeholder="diabetes, hypertension…" className={inputCls} /></div>
              <div><Label>Past injuries</Label><input name="injuries" type="text" placeholder="knee injury 2022…" className={inputCls} /></div>
              <div><Label>Additional health notes</Label><textarea name="healthNotes" rows={2} placeholder="Any other health information…" className={`${inputCls} resize-none`} /></div>
            </div>

            <Section title="Emergency Contact" icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} />
            <div className="grid grid-cols-3 gap-3 pb-2">
              <div><Label>Name</Label><input name="emergencyName" type="text" placeholder="Jane Doe" className={inputCls} /></div>
              <div><Label>Phone</Label><input name="emergencyPhone" type="tel" placeholder="+91 99999 00000" className={inputCls} /></div>
              <div><Label>Relation</Label><input name="emergencyRelation" type="text" placeholder="Spouse, Parent…" className={inputCls} /></div>
            </div>
          </Form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" form="add-member-form" disabled={isSubmitting}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${isSubmitting ? "bg-primary/50 text-primary-foreground" : "bg-primary text-primary-foreground"}`}>
            {isSubmitting ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Adding…</>
            ) : "Add member"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function Members({ loaderData, actionData }: Route.ComponentProps) {
  const { members, joinUrl, gymName, hasPlans } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [showModal, setShowModal] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const deleteFetcher = useFetcher();

  // ── Table state ──────────────────────────────────────────────────────────
  const [search, setSearch]       = useState("");
  const [planFilter, setPlan]     = useState<string>("all");
  const [statusFilter, setStatus] = useState<string>("all");
  const [sortKey, setSortKey]     = useState<SortKey>("joined");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [page, setPage]           = useState(1);

  useEffect(() => {
    if ((actionData as any)?.intent === "create" && (actionData as any)?.success) {
      setShowModal(false);
    }
  }, [actionData]);

  // reset page on filter change
  useEffect(() => { setPage(1); }, [search, planFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  // ── Filtering + sorting ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members
      .filter((m) => {
        const name  = `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
        const email = m.user.email.toLowerCase();
        const phone = (m.user.phone ?? "").toLowerCase();
        if (q && !name.includes(q) && !email.includes(q) && !phone.includes(q)) return false;
        if (planFilter !== "all" && m.membershipType !== planFilter) return false;
        const expired = isExpired(m.membershipEnd);
        if (statusFilter === "active" && expired) return false;
        if (statusFilter === "expired" && !expired) return false;
        return true;
      })
      .sort((a, b) => {
        let av: string | number = 0, bv: string | number = 0;
        if (sortKey === "name") {
          av = `${a.user.firstName} ${a.user.lastName}`.toLowerCase();
          bv = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
        } else if (sortKey === "plan") {
          av = a.membershipType; bv = b.membershipType;
        } else if (sortKey === "expires") {
          av = new Date(a.membershipEnd).getTime();
          bv = new Date(b.membershipEnd).getTime();
        } else if (sortKey === "status") {
          av = isExpired(a.membershipEnd) ? 1 : 0;
          bv = isExpired(b.membershipEnd) ? 1 : 0;
        } else {
          av = new Date(a.createdAt).getTime();
          bv = new Date(b.createdAt).getTime();
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [members, search, planFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount  = useMemo(() => members.filter((m) => !isExpired(m.membershipEnd) && m.isActive).length, [members]);
  const expiredCount = useMemo(() => members.filter((m) => isExpired(m.membershipEnd)).length, [members]);

  // ── Column header helper ─────────────────────────────────────────────────
  function Th({ label, sortable, sk }: { label: string; sortable?: boolean; sk?: SortKey }) {
    return (
      <th
        className={`text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${sortable ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
        onClick={sortable && sk ? () => toggleSort(sk) : undefined}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortable && sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
        </span>
      </th>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
          <h1 className="text-xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-400 mt-0.5">{members.length} total · {activeCount} active · {expiredCount} expired</p>
          </div>
          <div className="flex items-center gap-2">
          {joinUrl && hasPlans && (
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Share QR
            </button>
          )}
          <button
            onClick={() => hasPlans && setShowModal(true)}
            disabled={!hasPlans}
            title={!hasPlans ? "Create a membership plan first" : undefined}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add member
          </button>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-5 pb-16">
        {!hasPlans && (
          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>
              No membership plans found.{" "}
              <Link to="/plans" className="font-semibold underline underline-offset-2 hover:text-amber-900">
                Create a plan
              </Link>{" "}
              before adding members.
            </span>
          </div>
        )}

        {(actionData as any)?.intent === "delete" && (actionData as any)?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {(actionData as any).error}
          </div>
        )}

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: activeCount, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Expired", value: expiredCount, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            { label: "Premium", value: members.filter((m) => m.membershipType === "premium").length, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
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
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-white transition"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <FilterSelect
              value={planFilter}
              onChange={setPlan}
              options={[
                { value: "all",      label: "All plans"  },
                { value: "basic",    label: "Basic"      },
                { value: "standard", label: "Standard"   },
                { value: "premium",  label: "Premium"    },
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={setStatus}
              options={[
                { value: "all",     label: "All statuses" },
                { value: "active",  label: "Active"       },
                { value: "expired", label: "Expired"      },
              ]}
            />

            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                {members.length === 0 ? "No members yet — click Add member to get started." : "No members match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <Th label="Member"  sortable sk="name"    />
                    <Th label="Phone"   />
                    <Th label="Plan"    sortable sk="plan"    />
                    <Th label="Joined"  sortable sk="joined"  />
                    <Th label="Expires" sortable sk="expires" />
                    <Th label="Status"  sortable sk="status"  />
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((member) => {
                    const expired = isExpired(member.membershipEnd);
                    const name = `${member.user.firstName} ${member.user.lastName}`.trim();
                    return (
                      <tr key={member._id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold shrink-0">
                              {name[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{name}</p>
                              <p className="text-gray-400 text-xs">{member.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{member.user.phone ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_BADGE[member.membershipType]}`}>
                            {member.membershipType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(member.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(member.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${expired ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                            {expired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/members/${member._id}`}
                              className="text-xs font-medium text-gray-500 hover:text-primary transition px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ id: member._id, name })}
                              className="text-xs font-medium text-gray-400 hover:text-red-600 transition px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${p === page ? "bg-primary text-primary-foreground" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
                >›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove member?"
        message={confirmDelete ? `This will permanently remove ${confirmDelete.name} and all their data. This action cannot be undone.` : ""}
        confirmLabel="Remove"
        onConfirm={() => {
          if (!confirmDelete) return;
          const fd = new FormData();
          fd.append("intent", "delete");
          fd.append("id", confirmDelete.id);
          deleteFetcher.submit(fd, { method: "post" });
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {joinUrl && (
        <QrModal
          open={showQr}
          onClose={() => setShowQr(false)}
          joinUrl={joinUrl}
          gymName={gymName}
        />
      )}

      <AddMemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        isSubmitting={isSubmitting}
        error={(actionData as any)?.intent === "create" ? (actionData as any)?.error : null}
        fields={(actionData as any)?.intent === "create" ? (actionData as any)?.fields as FieldErrors | null : null}
      />
    </div>
  );
}
