import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.onboarding";

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const session = await requireSession(request);
  const stage = session.get("stage");

  if (stage === "registered") throw redirect("/verify");
  if (stage === "onboarded") throw redirect("/");

  return { firstName: session.get("firstName") ?? "" };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();

  const result = await api.post<{ data: unknown }>(
    "/api/gym-profile",
    {
      gymName: form.get("gymName"),
      strength: Number(form.get("strength")),
      city: form.get("city"),
      state: form.get("state"),
      address: form.get("address"),
      pincode: form.get("pincode"),
      phone: form.get("phone"),
      email: form.get("email"),
    },
    token
  );

  if (!result.success) {
    return { error: result.message ?? "Failed to create gym profile." };
  }

  session.set("stage", "onboarded");

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Onboarding({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { firstName } = loaderData;

  return (
    <div className="flex-1">
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#b45309" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#f59e0b" }} />
          Step 3 of 3 — Final step
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set Up Your Gym</h1>
        <p className="mt-1 text-sm text-slate-500">
          Great work, <span className="text-gray-800 font-semibold">{firstName}</span>! Tell us about your gym.
        </p>
      </div>

      <div className="mb-4 h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, #fde68a, #fed7aa, transparent)" }} />

      {actionData?.error && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gym Name *">
            <input name="gymName" required type="text" placeholder="Iron Paradise Gym"
              className="auth-input" />
          </Field>
          <Field label="Capacity (members) *">
            <input name="strength" required type="number" min={1} placeholder="200"
              className="auth-input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="City *">
            <input name="city" required type="text" placeholder="Mumbai"
              className="auth-input" />
          </Field>
          <Field label="State">
            <input name="state" type="text" placeholder="Maharashtra"
              className="auth-input" />
          </Field>
        </div>

        <Field label="Full Address">
          <input name="address" type="text" placeholder="123, Main Street, Andheri West"
            className="auth-input" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Pincode">
            <input name="pincode" type="text" placeholder="400053"
              className="auth-input" />
          </Field>
          <Field label="Gym Contact">
            <input name="phone" type="tel" placeholder="+91 98765 43210"
              className="auth-input" />
          </Field>
        </div>

        <Field label="Gym Email">
          <input name="email" type="email" placeholder="gym@example.com"
            className="auth-input" />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 font-bold rounded-xl text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1"
          style={{
            background: isSubmitting
              ? "rgba(245,158,11,0.6)"
              : "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
            boxShadow: isSubmitting ? "none" : "0 4px 14px rgba(245,158,11,0.3)",
            opacity: isSubmitting ? 0.8 : 1,
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating profile…
            </>
          ) : (
            <>
              Create gym profile
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </Form>
    </div>
  );
}
