import {
  Link,
  useNavigate,
  isRouteErrorResponse,
  Form,
  useFetcher,
  redirect,
  useSearchParams,
} from "react-router";
import { useMemo, useState, useEffect } from "react";
import type { Route } from "./+types/_app.members.$id";
import { MemberAttendanceHeatmap } from "~/components/MemberAttendanceHeatmap";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssignedPrograms = {
  diet?: { title?: string; notes?: string; items?: string[] };
  exercise?: {
    title?: string;
    notes?: string;
    routine?: { name?: string; detail?: string }[];
  };
};

type FullMember = {
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
  updatedAt?: string;
  physique?: { height?: number; weight?: number; bodyType?: string };
  diet?: { type?: string; allergies?: string[]; supplements?: string };
  goal?: { primary?: string; targetWeight?: number; notes?: string };
  health?: { medicalConditions?: string; injuries?: string; notes?: string };
  emergencyContact?: { name?: string; phone?: string; relation?: string };
  assignedPrograms?: AssignedPrograms;
  attendance?: { at: string }[];
};

type AttendancePayload = {
  year: number;
  days: Record<string, number>;
  totalVisits: number;
  uniqueDays: number;
};

// ─── Error boundary ───────────────────────────────────────────────────────────

export function ErrorBoundary({ error }: { error: unknown }) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-12 text-center bg-gray-50">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 border border-primary/20">
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900">
        {is404 ? "Member not found" : "Something went wrong"}
      </h1>
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
        {is404
          ? "This member may have been removed or the link is invalid."
          : "An unexpected error occurred while loading this member."}
      </p>
      <Link to="/members"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to members
      </Link>
    </div>
  );
}

// ─── Loader / Action ──────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const url = new URL(request.url);
  const cy = new Date().getFullYear();
  const y = parseInt(url.searchParams.get("year") || "", 10);
  const year = Number.isFinite(y) ? Math.min(cy, Math.max(2020, y)) : cy;

  const [memberResult, attResult] = await Promise.all([
    api.get<{ data: FullMember }>(`/api/members/${params.id}`, token),
    api.get<{ data: AttendancePayload }>(`/api/members/${params.id}/attendance?year=${year}`, token),
  ]);

  if (!memberResult.success || !memberResult.data) {
    throw new Response("Member not found", { status: 404 });
  }

  const attendance = attResult.success && attResult.data ? attResult.data : null;

  return {
    member: memberResult.data,
    attendance,
    year,
    maxYear: cy,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");
  const url = new URL(request.url);

  if (intent === "ai-suggest") {
    const result = await api.post<{
      data: {
        diet:     { title: string; notes: string; items: string[] };
        exercise: { title: string; notes: string; routine: { name: string; detail: string }[] };
      };
    }>(`/api/ai/members/${params.id}/suggest`, {}, token);
    if (!result.success) {
      return { ok: false as const, error: result.message ?? "AI generation failed." };
    }
    return { ok: true as const, aiPrograms: result.data };
  }

  if (intent === "programs") {
    const dietItems = String(form.get("dietItems") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const routineLines = String(form.get("exerciseRoutineLines") ?? "");
    const routine = routineLines
      .split("\n")
      .map((line) => {
        const m = line.trim();
        if (!m) return null;
        const parts = m.split(/[|—]/);
        return {
          name: parts[0]?.trim() ?? "",
          detail: parts.slice(1).join(" — ").trim(),
        };
      })
      .filter((r): r is { name: string; detail: string } => Boolean(r && r.name));

    const result = await api.put<{ data: FullMember }>(
      `/api/members/${params.id}/programs`,
      {
        diet: {
          title: String(form.get("dietTitle") ?? ""),
          notes: String(form.get("dietNotes") ?? ""),
          items: dietItems,
        },
        exercise: {
          title: String(form.get("exerciseTitle") ?? ""),
          notes: String(form.get("exerciseNotes") ?? ""),
          routine,
        },
      },
      token
    );
    if (!result.success) {
      return { ok: false as const, error: result.message ?? "Could not save programs." };
    }
    return redirect(`${url.pathname}${url.search}`);
  }

  if (intent === "checkin") {
    const result = await api.post(`/api/members/${params.id}/attendance`, {}, token);
    if (!result.success) {
      return { ok: false as const, error: result.message ?? "Could not log visit." };
    }
    return redirect(`${url.pathname}${url.search}`);
  }

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function formatDate(dateStr?: string, opts?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", opts ?? {
    day: "numeric", month: "long", year: "numeric",
  });
}

function age(dateStr?: string) {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  const now = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) a--;
  return a;
}

function computeBmi(heightCm?: number, weightKg?: number) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const m = heightCm / 100;
  const v = weightKg / (m * m);
  const bmi = Math.round(v * 10) / 10;
  const cat =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  return { bmi, cat };
}

const GOAL_LABEL: Record<string, string> = {
  "weight-loss": "Weight Loss",
  "muscle-gain": "Muscle Gain",
  endurance: "Endurance / Stamina",
  flexibility: "Flexibility",
  "general-fitness": "General Fitness",
  rehabilitation: "Rehabilitation",
};

const DIET_LABEL: Record<string, string> = {
  vegetarian: "Vegetarian",
  "non-vegetarian": "Non-Vegetarian",
  vegan: "Vegan",
  eggetarian: "Eggetarian",
};

const BODY_LABEL: Record<string, string> = {
  ectomorph: "Ectomorph (slim build)",
  mesomorph: "Mesomorph (athletic build)",
  endomorph: "Endomorph (stocky build)",
};

const inputDark =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-200">
        <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right flex-1">{value}</span>
    </div>
  );
}

type AiPrograms = {
  diet:     { title: string; notes: string; items: string[] };
  exercise: { title: string; notes: string; routine: { name: string; detail: string }[] };
};

function ProgramsForm({ member }: { member: FullMember }) {
  const saveFetcher = useFetcher();
  const aiFetcher   = useFetcher();

  const d = member.assignedPrograms?.diet;
  const e = member.assignedPrograms?.exercise;

  const initRoutineText = (e?.routine ?? [])
    .map((r) => {
      const name   = r.name?.trim()   ?? "";
      const detail = r.detail?.trim() ?? "";
      return detail ? `${name} — ${detail}` : name;
    })
    .filter(Boolean)
    .join("\n");

  const [dietTitle,    setDietTitle]    = useState(d?.title ?? "");
  const [dietNotes,    setDietNotes]    = useState(d?.notes ?? "");
  const [dietItems,    setDietItems]    = useState((d?.items ?? []).join("\n"));
  const [exTitle,      setExTitle]      = useState(e?.title ?? "");
  const [exNotes,      setExNotes]      = useState(e?.notes ?? "");
  const [routineLines, setRoutineLines] = useState(initRoutineText);
  const [aiApplied,    setAiApplied]    = useState(false);

  // When AI returns a result, populate all fields
  const aiData = (aiFetcher.data as any)?.aiPrograms as AiPrograms | undefined;
  const aiError = (aiFetcher.data as any)?.error as string | undefined;

  useEffect(() => {
    if (!aiData) return;
    setDietTitle(aiData.diet.title ?? "");
    setDietNotes(aiData.diet.notes ?? "");
    setDietItems((aiData.diet.items ?? []).join("\n"));
    setExTitle(aiData.exercise.title ?? "");
    setExNotes(aiData.exercise.notes ?? "");
    setRoutineLines(
      (aiData.exercise.routine ?? [])
        .map((r) => (r.detail ? `${r.name} — ${r.detail}` : r.name))
        .filter(Boolean)
        .join("\n")
    );
    setAiApplied(true);
  }, [aiData]);

  const saving    = saveFetcher.state !== "idle";
  const generating = aiFetcher.state !== "idle";

  return (
    <div className="space-y-5">
      {/* AI generate button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Programs &amp; Plans
        </p>
        <aiFetcher.Form method="post">
          <input type="hidden" name="intent" value="ai-suggest" />
          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition
              bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 disabled:opacity-50"
          >
            {generating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </aiFetcher.Form>
      </div>

      {/* AI banner */}
      {aiApplied && !generating && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AI plan generated — review and edit, then save.
          <button type="button" onClick={() => setAiApplied(false)} className="ml-auto text-violet-400 hover:text-violet-600">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
              <path d="M9.5 2.5l-7 7M2.5 2.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
        </div>
      )}

      {aiError && (
        <p className="text-xs text-red-500 font-medium">{aiError}</p>
      )}

      {/* Save form */}
      <saveFetcher.Form method="post" className="space-y-5">
        <input type="hidden" name="intent" value="programs" />

        {/* Diet */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diet plan</p>
          <div className="space-y-3">
            <input
              name="dietTitle"
              value={dietTitle}
              onChange={(e) => setDietTitle(e.target.value)}
              placeholder="Title (e.g. High protein, mild deficit)"
              className={inputDark}
            />
            <textarea
              name="dietNotes"
              value={dietNotes}
              onChange={(e) => setDietNotes(e.target.value)}
              rows={3}
              placeholder="Notes, calorie targets, meal timing…"
              className={`${inputDark} resize-y min-h-[80px]`}
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Meal list (one per line)</label>
              <textarea
                name="dietItems"
                value={dietItems}
                onChange={(e) => setDietItems(e.target.value)}
                rows={4}
                placeholder={"Breakfast: oats + fruit\nLunch: rice + dal + veg\n…"}
                className={`${inputDark} resize-y min-h-[96px] font-mono text-[13px]`}
              />
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exercise plan</p>
          <div className="space-y-3">
            <input
              name="exerciseTitle"
              value={exTitle}
              onChange={(e) => setExTitle(e.target.value)}
              placeholder="Title (e.g. Push / Pull / Legs)"
              className={inputDark}
            />
            <textarea
              name="exerciseNotes"
              value={exNotes}
              onChange={(e) => setExNotes(e.target.value)}
              rows={2}
              placeholder="Session length, progression, rest days…"
              className={`${inputDark} resize-y min-h-[64px]`}
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Routine (one per line — detail after — or |)
              </label>
              <textarea
                name="exerciseRoutineLines"
                value={routineLines}
                onChange={(e) => setRoutineLines(e.target.value)}
                rows={6}
                placeholder={"Squats — 3×10\nBench press — 3×8\nFace pulls | 3×15"}
                className={`${inputDark} resize-y min-h-[120px] font-mono text-[13px]`}
              />
            </div>
          </div>
        </div>

        {saveFetcher.data && typeof saveFetcher.data === "object" && "error" in saveFetcher.data &&
          (saveFetcher.data as { error?: string }).error && (
          <p className="text-sm text-red-400">{(saveFetcher.data as { error: string }).error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold transition"
        >
          {saving ? "Saving…" : "Save programs"}
        </button>
      </saveFetcher.Form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberDetail({ loaderData }: Route.ComponentProps) {
  const { member, attendance, year, maxYear } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitFetcher = useFetcher();

  const expired = isExpired(member.membershipEnd);
  const name = `${member.user.firstName} ${member.user.lastName}`.trim();
  const memberAge = age(member.user.dateOfBirth);
  const daysLeft = expired
    ? null
    : Math.ceil((new Date(member.membershipEnd).getTime() - Date.now()) / 86400000);

  const bmi = computeBmi(member.physique?.height, member.physique?.weight);

  const hasAssigned =
    Boolean(member.assignedPrograms?.diet?.title ||
      (member.assignedPrograms?.diet?.items && member.assignedPrograms.diet.items.length) ||
      member.assignedPrograms?.diet?.notes ||
      member.assignedPrograms?.exercise?.title ||
      (member.assignedPrograms?.exercise?.routine && member.assignedPrograms.exercise.routine.length > 0) ||
      member.assignedPrograms?.exercise?.notes);

  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= maxYear - 3; y--) list.push(y);
    return list;
  }, [maxYear]);

  const setYear = (y: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("year", String(y));
    navigate({ search: next.toString() }, { replace: true });
  };

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 sm:px-8 py-4 sticky top-0 z-10">
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
            <span className="text-sm text-gray-800 font-medium truncate">{name}</span>
          </div>
          <Link
            to="/members"
            className="text-xs font-medium text-gray-500 hover:text-primary transition shrink-0"
          >
            All members
          </Link>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 pb-16">

        {/* Profile hero */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
          <div
            className="h-28 sm:h-32 w-full relative"
            style={{ background: "color-mix(in oklch, var(--primary) 20%, var(--background))" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>

          <div className="px-6 sm:px-8 pb-8 -mt-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4">
                <div
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-white shrink-0"
                  style={{ background: "var(--primary)" }}
                >
                  {name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="pb-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">{name}</h1>
                  <p className="text-gray-500 text-sm mt-0.5 truncate">{member.user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    expired
                      ? "bg-red-950/60 text-red-300 border-red-800/80"
                      : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
                  }`}
                >
                  {expired ? "Expired" : "Active"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                    member.membershipType === "premium"
                      ? "bg-amber-950/50 text-amber-300 border-amber-800/70"
                      : member.membershipType === "standard"
                        ? "bg-primary/20 text-primary-foreground border-primary/40"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {member.membershipType}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "Member since",
                  value: formatDate(member.createdAt, { month: "short", year: "numeric" }),
                },
                {
                  label: "Expires",
                  value: formatDate(member.membershipEnd, { day: "numeric", month: "short", year: "numeric" }),
                  valueClass: expired ? "text-red-500" : daysLeft && daysLeft <= 7 ? "text-amber-600" : "text-gray-900",
                  sub: expired ? "Expired" : daysLeft !== null ? `${daysLeft} days left` : "",
                },
                {
                  label: "Age",
                  value: memberAge !== null ? `${memberAge} yrs` : "—",
                },
                {
                  label: "Goal",
                  value: member.goal?.primary ? GOAL_LABEL[member.goal.primary] ?? member.goal.primary : "—",
                },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-200 p-3.5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className={`text-sm font-bold mt-1 ${(s as { valueClass?: string }).valueClass ?? "text-gray-900"}`}>
                    {s.value}
                  </p>
                  {(s as { sub?: string }).sub ? (
                    <p className="text-xs text-gray-500 mt-0.5">{(s as { sub?: string }).sub}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BMI + attendance row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard
            title="BMI & body metrics"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {/* BMI Card */}
              {bmi ? (() => {
                const catMeta = bmi.cat === "Normal"
                  ? { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", label: "Normal" }
                  : bmi.cat === "Underweight"
                    ? { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.25)", label: "Underweight" }
                    : bmi.cat === "Overweight"
                      ? { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "Overweight" }
                      : { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)", label: "Obese" };

                // BMI gauge: clamp between 10–45, map to 0–100%
                const pct = Math.min(100, Math.max(0, ((bmi.bmi - 10) / 35) * 100));
                const segments = [
                  { label: "Under", range: "< 18.5", color: "#38bdf8", w: "24%" },
                  { label: "Normal", range: "18.5–25", color: "#10b981", w: "20%" },
                  { label: "Over", range: "25–30", color: "#f59e0b", w: "15%" },
                  { label: "Obese", range: "> 30", color: "#f97316", w: "41%" },
                ];

                return (
                  <div className="flex-1 rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: catMeta.bg, border: `1.5px solid ${catMeta.border}` }}>
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">BMI Index</span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: catMeta.bg, border: `1px solid ${catMeta.border}`, color: catMeta.color }}>
                        {catMeta.label}
                      </span>
                    </div>

                    {/* Big number */}
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black tabular-nums leading-none" style={{ color: catMeta.color }}>
                        {bmi.bmi}
                      </span>
                      <span className="text-xs text-gray-400 mb-1.5">kg/m²</span>
                    </div>

                    {/* Gauge bar */}
                    <div className="space-y-1.5">
                      <div className="relative h-2.5 rounded-full overflow-hidden flex gap-0.5">
                        {segments.map(s => (
                          <div key={s.label} style={{ width: s.w, background: `${s.color}30`, borderRadius: 4 }} />
                        ))}
                        {/* Indicator dot */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md transition-all"
                          style={{ left: `calc(${pct}% - 6px)`, background: catMeta.color }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>45</span>
                      </div>
                    </div>

                    {/* Source */}
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {member.physique?.height} cm · {member.physique?.weight} kg · Screening only
                    </p>
                  </div>
                );
              })() : (
                <div className="flex-1 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center p-6 text-center">
                  <p className="text-sm text-gray-400">Add height & weight to compute BMI</p>
                </div>
              )}

              {/* Body metrics */}
              <div className="flex-1 space-y-1 text-sm">
                <Row label="Height" value={member.physique?.height ? `${member.physique.height} cm` : undefined} />
                <Row label="Weight" value={member.physique?.weight ? `${member.physique.weight} kg` : undefined} />
                <Row
                  label="Body type"
                  value={
                    member.physique?.bodyType ? BODY_LABEL[member.physique.bodyType] ?? member.physique.bodyType : undefined
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Attendance"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Year</span>
                <div className="flex rounded-xl border border-gray-300 bg-gray-50 p-0.5">
                  {yearOptions.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        year === y ? "bg-primary text-primary-foreground shadow" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <visitFetcher.Form method="post">
                <input type="hidden" name="intent" value="checkin" />
                <button
                  type="submit"
                  disabled={visitFetcher.state !== "idle"}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {visitFetcher.state !== "idle" ? "Logging…" : "Log visit"}
                </button>
              </visitFetcher.Form>
            </div>

            {attendance ? (
              <MemberAttendanceHeatmap
                year={attendance.year}
                days={attendance.days}
                totalVisits={attendance.totalVisits}
                uniqueDays={attendance.uniqueDays}
              />
            ) : (
              <p className="text-sm text-gray-500">Could not load attendance.</p>
            )}
          </SectionCard>
        </div>

        {/* Assigned programs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title="Assigned diet & exercise"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          >
            {!hasAssigned ? (
              <p className="text-sm text-gray-500 mb-4">
                No staff-assigned diet or workout yet. Use the form to add a structured plan — members still keep their
                onboarding preferences below.
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {(member.assignedPrograms?.diet?.title ||
                  member.assignedPrograms?.diet?.notes ||
                  (member.assignedPrograms?.diet?.items && member.assignedPrograms.diet.items.length > 0)) && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wide mb-2">Diet</p>
                    {member.assignedPrograms?.diet?.title && (
                      <p className="text-gray-900 font-semibold">{member.assignedPrograms.diet.title}</p>
                    )}
                    {member.assignedPrograms?.diet?.notes && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{member.assignedPrograms.diet.notes}</p>
                    )}
                    {member.assignedPrograms?.diet?.items && member.assignedPrograms.diet.items.length > 0 && (
                      <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                        {member.assignedPrograms.diet.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {(member.assignedPrograms?.exercise?.title ||
                  member.assignedPrograms?.exercise?.notes ||
                  (member.assignedPrograms?.exercise?.routine &&
                    member.assignedPrograms.exercise.routine.length > 0)) && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-sky-400/90 uppercase tracking-wide mb-2">Exercise</p>
                    {member.assignedPrograms?.exercise?.title && (
                      <p className="text-gray-900 font-semibold">{member.assignedPrograms.exercise.title}</p>
                    )}
                    {member.assignedPrograms?.exercise?.notes && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                        {member.assignedPrograms.exercise.notes}
                      </p>
                    )}
                    {member.assignedPrograms?.exercise?.routine &&
                      member.assignedPrograms.exercise.routine.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {member.assignedPrograms.exercise.routine.map((r, i) => (
                            <li key={i} className="text-sm border-l-2 border-gray-300 pl-3">
                              <span className="text-gray-800 font-medium">{r.name}</span>
                              {r.detail ? <span className="text-gray-500"> — {r.detail}</span> : null}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>
            )}
            <ProgramsForm key={member.updatedAt ?? member._id} member={member} />
          </SectionCard>

          <div className="space-y-6">
            <SectionCard
              title="Contact"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              <Row label="Email" value={member.user.email} />
              <Row label="Phone" value={member.user.phone} />
              <Row
                label="Date of birth"
                value={
                  member.user.dateOfBirth
                    ? `${formatDate(member.user.dateOfBirth)} ${memberAge !== null ? `(${memberAge} yrs)` : ""}`
                    : undefined
                }
              />
            </SectionCard>

            <SectionCard
              title="Membership"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
            >
              <Row label="Plan" value={<span className="capitalize">{member.membershipType}</span>} />
              <Row label="Start" value={formatDate(member.membershipStart)} />
              <Row
                label="Expires"
                value={
                  <span className={expired ? "text-red-400" : daysLeft && daysLeft <= 7 ? "text-amber-400" : ""}>
                    {formatDate(member.membershipEnd)}
                    {!expired && daysLeft !== null && (
                      <span className="ml-2 text-xs font-normal text-gray-500">({daysLeft}d left)</span>
                    )}
                    {expired && <span className="ml-2 text-xs font-normal text-red-400/80">(expired)</span>}
                  </span>
                }
              />
            </SectionCard>
          </div>
        </div>

        {/* Preferences grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard
            title="Diet preferences (onboarding)"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            <Row label="Diet type" value={member.diet?.type ? DIET_LABEL[member.diet.type] ?? member.diet.type : undefined} />
            <Row label="Allergies" value={member.diet?.allergies?.length ? member.diet.allergies.join(", ") : undefined} />
            <Row label="Supplements" value={member.diet?.supplements} />
            {!member.diet?.type && !member.diet?.allergies?.length && !member.diet?.supplements && (
              <p className="text-xs text-gray-500 py-2">No diet preferences recorded.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Fitness goal"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            <Row
              label="Primary goal"
              value={member.goal?.primary ? GOAL_LABEL[member.goal.primary] ?? member.goal.primary : undefined}
            />
            <Row label="Target weight" value={member.goal?.targetWeight ? `${member.goal.targetWeight} kg` : undefined} />
            <Row label="Notes" value={member.goal?.notes} />
          </SectionCard>

          <SectionCard
            title="Health & medical"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            <Row label="Conditions" value={member.health?.medicalConditions} />
            <Row label="Injuries" value={member.health?.injuries} />
            <Row label="Notes" value={member.health?.notes} />
            {!member.health?.medicalConditions && !member.health?.injuries && !member.health?.notes && (
              <p className="text-xs text-gray-500 py-2">No health information recorded.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Emergency contact"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          >
            <Row label="Name" value={member.emergencyContact?.name} />
            <Row label="Phone" value={member.emergencyContact?.phone} />
            <Row label="Relation" value={member.emergencyContact?.relation} />
            {!member.emergencyContact?.name && !member.emergencyContact?.phone && (
              <p className="text-xs text-gray-500 py-2">No emergency contact recorded.</p>
            )}
          </SectionCard>
        </div>

        <div className="pt-2">
          <Link
            to="/members"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to members
          </Link>
        </div>
      </div>
    </div>
  );
}
