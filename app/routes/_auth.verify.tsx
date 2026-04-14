import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.verify";

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const session = await requireSession(request);
  const stage = session.get("stage");

  if (stage === "verified") throw redirect("/onboarding");
  if (stage === "onboarded") throw redirect("/");

  return {
    email: session.get("email") ?? "",
    firstName: session.get("firstName") ?? "",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "resend") {
    const result = await api.post("/api/auth/resend-otp", {}, token);
    if (!result.success) return { error: result.message, resent: false };
    return { resent: true, error: null };
  }

  const code = form.get("code") as string;
  const result = await api.post<{ token: string; stage: string; user: { firstName: string; email: string } }>(
    "/api/auth/verify-otp",
    { code },
    token
  );

  if (!result.success) {
    return { error: result.message ?? "Invalid OTP.", resent: false };
  }

  session.set("token", result.token!);
  session.set("stage", "verified");

  return redirect("/onboarding", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Verify({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { email, firstName } = loaderData;

  return (
    <div className="flex-1">
      {/* Icon + heading */}
      <div className="mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15))",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 0 24px rgba(99,102,241,0.15)",
          }}>
          <svg className="w-6 h-6" style={{ color: "#a5b4fc" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          Code expires in 10 minutes
        </div>

        <h1 className="text-[26px] font-black tracking-tight leading-tight"
          style={{ background: "linear-gradient(135deg, #fff 30%, #a5b4fc 70%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Verify your email
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
          Hi <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{firstName}</span>! We sent a 6-digit code to{" "}
          <span style={{ color: "#a5b4fc", fontWeight: 500 }}>{email}</span>.
        </p>
      </div>

      {/* Success */}
      {actionData?.resent && (
        <div className="mb-4 p-3 rounded-xl text-sm"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>
          A new code has been sent to your email.
        </div>
      )}

      {/* Error */}
      {actionData?.error && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
            style={{ color: "rgba(148,163,184,0.7)" }}>Verification code</label>
          <input
            name="code"
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="000000"
            className="auth-input"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#f1f5f9",
              fontSize: "28px",
              padding: "12px 14px",
              width: "100%",
              outline: "none",
              textAlign: "center",
              letterSpacing: "0.5em",
              fontFamily: "monospace",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 font-bold rounded-xl text-sm text-white transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            background: isSubmitting
              ? "rgba(99,102,241,0.5)"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
            boxShadow: isSubmitting ? "none" : "0 0 32px rgba(99,102,241,0.4), 0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying…
            </>
          ) : "VERIFY ACCOUNT"}
        </button>
      </Form>

      <div className="mt-5 text-center">
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Didn't receive the code?{" "}
          <Form method="post" className="inline">
            <input type="hidden" name="intent" value="resend" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-semibold transition disabled:opacity-40"
              style={{ color: "#a5b4fc" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c7d2fe")}
              onMouseLeave={e => (e.currentTarget.style.color = "#a5b4fc")}
            >
              Resend code
            </button>
          </Form>
        </p>
      </div>

      <style>{`
        .auth-input::placeholder { color: rgba(148,163,184,0.25); }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 12px rgba(99,102,241,0.1);
        }
        .auth-input:hover { border-color: rgba(255,255,255,0.2) !important; }
      `}</style>
    </div>
  );
}
