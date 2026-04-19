import { useFetcher } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/join.$qrToken";

// ─── Server ───────────────────────────────────────────────────────────────────

type GymInfo = { gymName: string; city?: string; state?: string; country?: string };

export async function loader({ params }: Route.LoaderArgs) {
  const { api } = await import("~/lib/api.server");
  const result = await api.get<{ data: GymInfo }>(`/api/public/gym/${params.qrToken}`);
  if (!result.success) throw new Response("Gym not found", { status: 404 });
  return { gym: result.data!, qrToken: params.qrToken };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();
  const body = {
    firstName:         form.get("firstName"),
    lastName:          form.get("lastName"),
    email:             form.get("email"),
    phone:             form.get("phone") || undefined,
    dateOfBirth:       form.get("dateOfBirth") || undefined,
    membershipType:    form.get("membershipType"),
    membershipEnd:     form.get("membershipEnd"),
    height:            form.get("height") || undefined,
    weight:            form.get("weight") || undefined,
    bodyType:          form.get("bodyType") || undefined,
    dietType:          form.get("dietType") || undefined,
    allergies:         form.get("allergies") || undefined,
    supplements:       form.get("supplements") || undefined,
    primaryGoal:       form.get("primaryGoal") || undefined,
    targetWeight:      form.get("targetWeight") || undefined,
    goalNotes:         form.get("goalNotes") || undefined,
    medicalConditions: form.get("medicalConditions") || undefined,
    injuries:          form.get("injuries") || undefined,
    healthNotes:       form.get("healthNotes") || undefined,
    emergencyName:     form.get("emergencyName") || undefined,
    emergencyPhone:    form.get("emergencyPhone") || undefined,
    emergencyRelation: form.get("emergencyRelation") || undefined,
  };
  const result = await api.post(`/api/public/gym/${params.qrToken}/join`, body);
  if (!result.success) return { error: result.message ?? "Something went wrong." };
  return { success: true };
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)" }}>
      <div className="text-5xl">🏋️</div>
      <h1 className="text-xl font-black text-gray-900">Invalid QR Code</h1>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        This link is no longer valid. Ask your gym for a new QR code.
      </p>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  firstName: string; lastName: string; email: string; phone: string; dateOfBirth: string;
  membershipType: string; membershipEnd: string;
  height: string; weight: string; bodyType: string;
  dietType: string; allergies: string; supplements: string;
  primaryGoal: string; targetWeight: string; goalNotes: string;
  medicalConditions: string; injuries: string; healthNotes: string;
  emergencyName: string; emergencyPhone: string; emergencyRelation: string;
};

const INIT: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
  membershipType: "basic", membershipEnd: "",
  height: "", weight: "", bodyType: "",
  dietType: "", allergies: "", supplements: "",
  primaryGoal: "", targetWeight: "", goalNotes: "",
  medicalConditions: "", injuries: "", healthNotes: "",
  emergencyName: "", emergencyPhone: "", emergencyRelation: "",
};

// ─── Small UI pieces ──────────────────────────────────────────────────────────

function Input({ label, name, value, onChange, type = "text", placeholder, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      <input
        name={name} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange, placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea
        name={name} value={value} placeholder={placeholder} rows={3}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
      />
    </div>
  );
}

function OptionGrid({ options, value, onChange }: {
  options: { value: string; label: string; icon: string; desc?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => {
        const sel = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all"
            style={{
              borderColor: sel ? "#f97316" : "#e5e7eb",
              background: sel ? "linear-gradient(135deg,#fff7ed,#ffedd5)" : "#fff",
              boxShadow: sel ? "0 4px 16px rgba(249,115,22,0.18)" : "none",
              transform: sel ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className={`text-sm font-bold ${sel ? "text-orange-600" : "text-gray-700"}`}>
              {opt.label}
            </span>
            {opt.desc && (
              <span className="text-xs text-gray-400 leading-tight">{opt.desc}</span>
            )}
            {sel && (
              <span className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  { value: "basic",    icon: "🥉", label: "Basic",    desc: "Essential access" },
  { value: "standard", icon: "🥈", label: "Standard", desc: "Most popular" },
  { value: "premium",  icon: "🥇", label: "Premium",  desc: "Full access" },
];

const BODY_OPTIONS = [
  { value: "ectomorph", icon: "🏃", label: "Ectomorph", desc: "Lean & light" },
  { value: "mesomorph", icon: "💪", label: "Mesomorph", desc: "Athletic & muscular" },
  { value: "endomorph", icon: "🐻", label: "Endomorph", desc: "Solid & stocky" },
];

const DIET_OPTIONS = [
  { value: "vegetarian",     icon: "🥦", label: "Vegetarian" },
  { value: "non-vegetarian", icon: "🍗", label: "Non-Veg" },
  { value: "vegan",          icon: "🌱", label: "Vegan" },
  { value: "eggetarian",     icon: "🥚", label: "Eggetarian" },
];

const GOAL_OPTIONS = [
  { value: "weight-loss",     icon: "🔥", label: "Weight Loss",     desc: "Burn fat & slim down" },
  { value: "muscle-gain",     icon: "💪", label: "Muscle Gain",     desc: "Build strength & size" },
  { value: "endurance",       icon: "🏃", label: "Endurance",       desc: "Run longer, go harder" },
  { value: "flexibility",     icon: "🧘", label: "Flexibility",     desc: "Stretch & mobility" },
  { value: "general-fitness", icon: "⚡", label: "General Fitness", desc: "Stay active & healthy" },
  { value: "rehabilitation",  icon: "🩺", label: "Rehab",           desc: "Recover & rebuild" },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

const STEP_LABELS = ["You", "Plan", "Body", "Diet", "Goal", "Health"];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full px-6 pt-6 pb-4">
      <div className="flex items-center justify-between mb-3">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done
                    ? "linear-gradient(135deg,#f59e0b,#f97316)"
                    : active
                    ? "linear-gradient(135deg,#f59e0b,#f97316)"
                    : "#f1f5f9",
                  color: done || active ? "#fff" : "#94a3b8",
                  boxShadow: active ? "0 4px 12px rgba(249,115,22,0.4)" : "none",
                  transform: active ? "scale(1.15)" : "scale(1)",
                }}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${active ? "text-orange-500" : done ? "text-gray-400" : "text-gray-300"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-gray-100 mt-1">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${(step / (total - 1)) * 100}%`,
            background: "linear-gradient(90deg,#f59e0b,#f97316)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Individual step views ────────────────────────────────────────────────────

function StepPersonal({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-gray-900">Tell us about you</h2>
        <p className="text-sm text-gray-400 mt-0.5">Basic info to set up your membership</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" name="firstName" value={data.firstName} onChange={v => set("firstName", v)} placeholder="John" required />
        <Input label="Last name"  name="lastName"  value={data.lastName}  onChange={v => set("lastName", v)}  placeholder="Doe"  required />
      </div>
      <Input label="Email" name="email" type="email" value={data.email} onChange={v => set("email", v)} placeholder="john@example.com" required />
      <Input label="Phone" name="phone" type="tel"   value={data.phone} onChange={v => set("phone", v)} placeholder="+91 98765 43210" />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of birth</label>
        <input
          type="date" name="dateOfBirth" value={data.dateOfBirth}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => set("dateOfBirth", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}

function StepPlan({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Choose your plan</h2>
        <p className="text-sm text-gray-400 mt-0.5">Pick the membership that suits you</p>
      </div>
      <OptionGrid options={PLAN_OPTIONS} value={data.membershipType} onChange={v => set("membershipType", v)} />
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Membership valid until <span className="text-orange-500">*</span>
        </label>
        <input
          type="date" name="membershipEnd" value={data.membershipEnd}
          min={new Date().toISOString().split("T")[0]}
          onChange={e => set("membershipEnd", e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}

function StepBody({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Your physique</h2>
        <p className="text-sm text-gray-400 mt-0.5">Helps us personalise your fitness plan</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Height (cm)" name="height" type="number" value={data.height} onChange={v => set("height", v)} placeholder="175" />
        <Input label="Weight (kg)" name="weight" type="number" value={data.weight} onChange={v => set("weight", v)} placeholder="70" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Body type</p>
        <OptionGrid options={BODY_OPTIONS} value={data.bodyType} onChange={v => set("bodyType", v)} />
      </div>
    </div>
  );
}

function StepDiet({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Your diet</h2>
        <p className="text-sm text-gray-400 mt-0.5">So we can support your nutrition goals</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Diet preference</p>
        <OptionGrid options={DIET_OPTIONS} value={data.dietType} onChange={v => set("dietType", v)} />
      </div>
      <Input label="Food allergies" name="allergies" value={data.allergies} onChange={v => set("allergies", v)} placeholder="nuts, dairy, gluten…" />
      <Input label="Supplements" name="supplements" value={data.supplements} onChange={v => set("supplements", v)} placeholder="Whey, Creatine…" />
    </div>
  );
}

function StepGoal({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Your fitness goal</h2>
        <p className="text-sm text-gray-400 mt-0.5">What are you training for?</p>
      </div>
      <OptionGrid options={GOAL_OPTIONS} value={data.primaryGoal} onChange={v => set("primaryGoal", v)} />
      <Input label="Target weight (kg)" name="targetWeight" type="number" value={data.targetWeight} onChange={v => set("targetWeight", v)} placeholder="65" />
      <TextArea label="Anything specific you want to achieve?" name="goalNotes" value={data.goalNotes} onChange={v => set("goalNotes", v)} placeholder="e.g. run a 5K, fit into old clothes…" />
    </div>
  );
}

function StepHealth({ data, set }: { data: FormData; set: (k: keyof FormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Health & emergency</h2>
        <p className="text-sm text-gray-400 mt-0.5">Kept private — only for your safety</p>
      </div>
      <TextArea label="Medical conditions" name="medicalConditions" value={data.medicalConditions} onChange={v => set("medicalConditions", v)} placeholder="diabetes, hypertension, asthma…" />
      <TextArea label="Past injuries" name="injuries" value={data.injuries} onChange={v => set("injuries", v)} placeholder="knee surgery 2022, lower back pain…" />
      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-bold text-gray-700 mb-3">Emergency contact</p>
        <div className="space-y-3">
          <Input label="Contact name" name="emergencyName" value={data.emergencyName} onChange={v => set("emergencyName", v)} placeholder="Jane Doe" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" name="emergencyPhone" type="tel" value={data.emergencyPhone} onChange={v => set("emergencyPhone", v)} placeholder="+91 99999 00000" />
            <Input label="Relation" name="emergencyRelation" value={data.emergencyRelation} onChange={v => set("emergencyRelation", v)} placeholder="Spouse, Parent…" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6;

export default function JoinGym({ loaderData }: Route.ComponentProps) {
  const { gym } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INIT);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormData, v: string) => setData(d => ({ ...d, [k]: v }));

  // Watch for server response
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if ((fetcher.data as any).error) setError((fetcher.data as any).error);
    }
  }, [fetcher.state, fetcher.data]);

  const validate = (): string | null => {
    if (step === 0) {
      if (!data.firstName.trim()) return "First name is required.";
      if (!data.lastName.trim())  return "Last name is required.";
      if (!data.email.trim())     return "Email is required.";
      if (!/\S+@\S+\.\S+/.test(data.email)) return "Enter a valid email.";
    }
    if (step === 1 && !data.membershipEnd) return "Please select a membership end date.";
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else submit();
  };

  const submit = () => {
    const fd = new FormData();
    (Object.entries(data) as [string, string][]).forEach(([k, v]) => { if (v) fd.append(k, v); });
    fetcher.submit(fd, { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";

  // Success screen
  if ((fetcher.data as any)?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)" }}>
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg,#d1fae5,#6ee7b7)", boxShadow: "0 8px 32px rgba(52,211,153,0.35)" }}>
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Welcome aboard! 🎉</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              You're registered at <span className="font-bold text-gray-800">{gym.gymName}</span>.
              The staff will confirm your membership details soon.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm text-gray-500">
            <span className="text-xl">🏋️</span>
            Time to get started!
          </div>
        </div>
      </div>
    );
  }

  const locationParts = [gym.city, gym.state].filter(Boolean);

  return (
    <div className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg,#fff7ed 0%,#fef3c7 100%)" }}>
      <div className="w-full max-w-md mx-auto">

        {/* Gym header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 6px 20px rgba(249,115,22,0.35)" }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-black text-gray-900">{gym.gymName}</h1>
          {locationParts.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{locationParts.join(", ")}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <ProgressBar step={step} total={TOTAL_STEPS} />

          <div className="px-6 pb-6">
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Step content */}
            <div key={step} style={{ animation: "stepIn 0.22s ease both" }}>
              {step === 0 && <StepPersonal data={data} set={set} />}
              {step === 1 && <StepPlan     data={data} set={set} />}
              {step === 2 && <StepBody     data={data} set={set} />}
              {step === 3 && <StepDiet     data={data} set={set} />}
              {step === 4 && <StepGoal     data={data} set={set} />}
              {step === 5 && <StepHealth   data={data} set={set} />}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => { setError(null); setStep(s => s - 1); }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all"
                style={{
                  background: isSubmitting ? "rgba(249,115,22,0.45)" : "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)",
                  boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(249,115,22,0.4)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Submitting…
                  </>
                ) : step === TOTAL_STEPS - 1 ? (
                  <>
                    Join {gym.gymName}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">Powered by Gravity Gym</p>
      </div>

      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
