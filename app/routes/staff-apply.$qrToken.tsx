import { useFetcher } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/staff-apply.$qrToken";

// ─── Server ───────────────────────────────────────────────────────────────────

type GymInfo = { gymName: string; city?: string; state?: string };

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
    firstName: form.get("firstName"),
    lastName:  form.get("lastName"),
    phone:     form.get("phone"),
    email:     form.get("email") || undefined,
    gender:    form.get("gender"),
    role:      form.get("role"),
  };
  const result = await api.post(`/api/public/gym/${params.qrToken}/staff-apply`, body);
  if (!result.success) return { error: result.message ?? "Something went wrong." };
  return { success: true };
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
      <div className="text-5xl">🏋️</div>
      <h1 className="text-xl font-black text-gray-900">Invalid QR Code</h1>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        This link is no longer valid. Ask the gym for a new QR code.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { value: "trainer",      label: "Trainer",      icon: "💪" },
  { value: "receptionist", label: "Receptionist", icon: "🖥️" },
  { value: "manager",      label: "Manager",      icon: "📋" },
  { value: "cleaner",      label: "Cleaner",      icon: "🧹" },
];

const GENDERS = [
  { value: "male",   label: "Male",   icon: "👨" },
  { value: "female", label: "Female", icon: "👩" },
  { value: "other",  label: "Other",  icon: "🧑" },
];

function Input({ label, name, type = "text", placeholder, required, value, onChange }: {
  label: string; name: string; type?: string; placeholder?: string;
  required?: boolean; value: string; onChange: (v: string) => void;
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

export default function StaffApply({ loaderData }: Route.ComponentProps) {
  const { gym, qrToken } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [gender,    setGender]    = useState("");
  const [role,      setRole]      = useState("");

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if ((fetcher.data as any).error) setError((fetcher.data as any).error);
    }
  }, [fetcher.state, fetcher.data]);

  const submit = () => {
    if (!firstName.trim()) return setError("First name is required.");
    if (!lastName.trim())  return setError("Last name is required.");
    if (!phone.trim())     return setError("Phone number is required.");
    if (!gender)           return setError("Please select your gender.");
    if (!role)             return setError("Please select the role you're applying for.");
    setError(null);
    const fd = new FormData();
    fd.append("firstName", firstName);
    fd.append("lastName",  lastName);
    fd.append("phone",     phone);
    if (email) fd.append("email", email);
    fd.append("gender", gender);
    fd.append("role",   role);
    fetcher.submit(fd, { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";
  const locationParts = [gym.city, gym.state].filter(Boolean);

  // Success screen
  if ((fetcher.data as any)?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg,#d1fae5,#6ee7b7)", boxShadow: "0 8px 32px rgba(52,211,153,0.35)" }}>
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Application sent! 🎉</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Your application to join <span className="font-bold text-gray-800">{gym.gymName}</span> has been submitted.
              The admin will review and activate your profile.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm text-gray-500">
            <span className="text-xl">🏋️</span>
            We'll be in touch soon!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)" }}>
      <div className="w-full max-w-md mx-auto">

        {/* Gym header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 6px 20px rgba(249,115,22,0.35)" }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-black text-gray-900">{gym.gymName}</h1>
          {locationParts.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{locationParts.join(", ")}</p>
          )}
          <p className="text-sm text-gray-500 mt-1.5">Staff Application</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-xl font-black text-gray-900">Join the team</h2>
            <p className="text-sm text-gray-400 mt-0.5">Fill in your details to apply for a staff position</p>
          </div>

          <div className="px-6 pb-6 pt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" name="firstName" value={firstName} onChange={setFirstName} placeholder="Arjun" required />
              <Input label="Last name"  name="lastName"  value={lastName}  onChange={setLastName}  placeholder="Sharma" required />
            </div>
            <Input label="Phone" name="phone" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" required />
            <Input label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="arjun@email.com" />

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-orange-500">*</span>
              </label>
              <div className="flex gap-2">
                {GENDERS.map(g => (
                  <button key={g.value} type="button" onClick={() => setGender(g.value)}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: gender === g.value ? "#f97316" : "#e5e7eb",
                      background:  gender === g.value ? "linear-gradient(135deg,#fff7ed,#ffedd5)" : "#fff",
                    }}>
                    <span className="text-lg">{g.icon}</span>
                    <span className={`text-xs font-bold ${gender === g.value ? "text-orange-600" : "text-gray-500"}`}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role applying for <span className="text-orange-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: role === r.value ? "#f97316" : "#e5e7eb",
                      background:  role === r.value ? "linear-gradient(135deg,#fff7ed,#ffedd5)" : "#fff",
                    }}>
                    <span className="text-lg">{r.icon}</span>
                    <span className={`text-sm font-semibold ${role === r.value ? "text-orange-600" : "text-gray-700"}`}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all mt-2"
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
              ) : (
                <>
                  Submit Application
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
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
