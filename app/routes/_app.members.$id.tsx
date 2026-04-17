import { Link, useNavigate, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/_app.members.$id";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  physique?: { height?: number; weight?: number; bodyType?: string };
  diet?: { type?: string; allergies?: string[]; supplements?: string };
  goal?: { primary?: string; targetWeight?: number; notes?: string };
  health?: { medicalConditions?: string; injuries?: string; notes?: string };
  emergencyContact?: { name?: string; phone?: string; relation?: string };
};

// ─── Error boundary ───────────────────────────────────────────────────────────

export function ErrorBoundary({ error }: { error: unknown }) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900">
        {is404 ? "Member not found" : "Something went wrong"}
      </h1>
      <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
        {is404
          ? "This member may have been removed or the link is invalid."
          : "An unexpected error occurred while loading this member."}
      </p>
      <Link to="/members"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to members
      </Link>
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const result = await api.get<{ data: FullMember }>(`/api/members/${params.id}`, token);
  if (!result.success || !result.data) {
    throw new Response("Member not found", { status: 404 });
  }
  return { member: result.data };
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
  const dob  = new Date(dateStr);
  const now  = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) a--;
  return a;
}

const GOAL_LABEL: Record<string, string> = {
  "weight-loss":     "Weight Loss",
  "muscle-gain":     "Muscle Gain",
  "endurance":       "Endurance / Stamina",
  "flexibility":     "Flexibility",
  "general-fitness": "General Fitness",
  "rehabilitation":  "Rehabilitation",
};

const DIET_LABEL: Record<string, string> = {
  vegetarian:       "Vegetarian 🥦",
  "non-vegetarian": "Non-Vegetarian 🍗",
  vegan:            "Vegan 🌱",
  eggetarian:       "Eggetarian 🥚",
};

const BODY_LABEL: Record<string, string> = {
  ectomorph:  "Ectomorph (slim build)",
  mesomorph:  "Mesomorph (athletic build)",
  endomorph:  "Endomorph (stocky build)",
};

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <span className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemberDetail({ loaderData }: Route.ComponentProps) {
  const { member } = loaderData;
  const navigate = useNavigate();
  const expired = isExpired(member.membershipEnd);
  const name = `${member.user.firstName} ${member.user.lastName}`.trim();
  const memberAge = age(member.user.dateOfBirth);

  const daysLeft = expired
    ? null
    : Math.ceil((new Date(member.membershipEnd).getTime() - Date.now()) / 86400000);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Members
          </button>
          <span className="text-gray-200">/</span>
          <span className="text-sm text-gray-700 font-medium">{name}</span>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-6">

        {/* Profile hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Gradient banner */}
          <div className="h-24 w-full" style={{ background: "linear-gradient(135deg,#f97316 0%,#f59e0b 50%,#fde68a 100%)" }} />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-white"
                style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                {name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex items-center gap-2 pb-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${expired ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                  {expired ? "Expired" : "Active"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  member.membershipType === "premium" ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : member.membershipType === "standard" ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  {member.membershipType}
                </span>
              </div>
            </div>

            {/* Name + meta */}
            <h1 className="text-2xl font-black text-gray-900">{name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{member.user.email}</p>

            {/* Quick stats */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Member since",
                  value: formatDate(member.createdAt, { month: "short", year: "numeric" }),
                },
                {
                  label: "Expires",
                  value: formatDate(member.membershipEnd, { day: "numeric", month: "short", year: "numeric" }),
                  valueClass: expired ? "text-red-600" : daysLeft && daysLeft <= 7 ? "text-amber-600" : "text-gray-900",
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
                <div key={s.label} className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-sm font-bold mt-1 ${(s as any).valueClass ?? "text-gray-900"}`}>{s.value}</p>
                  {(s as any).sub && <p className="text-xs text-gray-400 mt-0.5">{(s as any).sub}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact */}
          <Card title="Contact Info" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }>
            <Row label="Email"  value={member.user.email} />
            <Row label="Phone"  value={member.user.phone} />
            <Row label="Date of birth" value={member.user.dateOfBirth
              ? `${formatDate(member.user.dateOfBirth)} ${memberAge !== null ? `(${memberAge} yrs)` : ""}`
              : undefined}
            />
          </Card>

          {/* Membership */}
          <Card title="Membership" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          }>
            <Row label="Plan"  value={<span className="capitalize">{member.membershipType}</span>} />
            <Row label="Start" value={formatDate(member.membershipStart)} />
            <Row label="Expires" value={
              <span className={expired ? "text-red-600" : daysLeft && daysLeft <= 7 ? "text-amber-600" : ""}>
                {formatDate(member.membershipEnd)}
                {!expired && daysLeft !== null && (
                  <span className="ml-2 text-xs font-normal text-gray-400">({daysLeft}d left)</span>
                )}
                {expired && <span className="ml-2 text-xs font-normal text-red-400">(expired)</span>}
              </span>
            } />
          </Card>

          {/* Physique */}
          <Card title="Body & Physique" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }>
            <Row label="Height" value={member.physique?.height ? `${member.physique.height} cm` : undefined} />
            <Row label="Weight" value={member.physique?.weight ? `${member.physique.weight} kg` : undefined} />
            <Row label="Body type" value={member.physique?.bodyType ? (BODY_LABEL[member.physique.bodyType] ?? member.physique.bodyType) : undefined} />
            {/* BMI */}
            {member.physique?.height && member.physique?.weight && (() => {
              const bmi = (member.physique.weight! / ((member.physique.height! / 100) ** 2)).toFixed(1);
              const cat = Number(bmi) < 18.5 ? "Underweight" : Number(bmi) < 25 ? "Normal" : Number(bmi) < 30 ? "Overweight" : "Obese";
              return <Row label="BMI" value={`${bmi} (${cat})`} />;
            })()}
          </Card>

          {/* Diet */}
          <Card title="Diet & Nutrition" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }>
            <Row label="Diet type" value={member.diet?.type ? (DIET_LABEL[member.diet.type] ?? member.diet.type) : undefined} />
            <Row label="Allergies" value={member.diet?.allergies?.length ? member.diet.allergies.join(", ") : undefined} />
            <Row label="Supplements" value={member.diet?.supplements} />
          </Card>

          {/* Goal */}
          <Card title="Fitness Goal" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }>
            <Row label="Primary goal" value={member.goal?.primary ? (GOAL_LABEL[member.goal.primary] ?? member.goal.primary) : undefined} />
            <Row label="Target weight" value={member.goal?.targetWeight ? `${member.goal.targetWeight} kg` : undefined} />
            <Row label="Notes" value={member.goal?.notes} />
          </Card>

          {/* Health */}
          <Card title="Health & Medical" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }>
            <Row label="Conditions" value={member.health?.medicalConditions} />
            <Row label="Injuries" value={member.health?.injuries} />
            <Row label="Notes" value={member.health?.notes} />
            {!member.health?.medicalConditions && !member.health?.injuries && !member.health?.notes && (
              <p className="text-xs text-gray-400 py-2">No health information recorded.</p>
            )}
          </Card>

          {/* Emergency contact */}
          <Card title="Emergency Contact" icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }>
            <Row label="Name"     value={member.emergencyContact?.name} />
            <Row label="Phone"    value={member.emergencyContact?.phone} />
            <Row label="Relation" value={member.emergencyContact?.relation} />
            {!member.emergencyContact?.name && !member.emergencyContact?.phone && (
              <p className="text-xs text-gray-400 py-2">No emergency contact recorded.</p>
            )}
          </Card>

        </div>

        {/* Back link */}
        <div className="pb-4">
          <Link to="/members"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-600 transition font-medium">
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
