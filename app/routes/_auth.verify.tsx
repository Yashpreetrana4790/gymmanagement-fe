import { Form, redirect, useNavigation, useSubmit } from "react-router";
import { useState, useRef, useEffect } from "react";
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
    "/api/auth/verify-otp", { code }, token
  );

  if (!result.success) return { error: result.message ?? "Invalid or expired code.", resent: false };

  session.set("token", result.token!);
  session.set("stage", "verified");

  return redirect("/onboarding", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

// ─── OTP boxes ────────────────────────────────────────────────────────────────

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const refs   = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => onChange(next.join(""));

  const handleChange = (idx: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = digits.map((v, i) => (i === idx ? d : v));
    commit(next);
    if (d && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx]) {
        const next = digits.map((v, i) => (i === idx ? "" : v));
        commit(next);
      } else if (idx > 0) {
        const next = digits.map((v, i) => (i === idx - 1 ? "" : v));
        commit(next);
        refs.current[idx - 1]?.focus();
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const next = digits.map((v, i) => (i === idx ? "" : v));
      commit(next);
    } else if (e.key === "ArrowLeft"  && idx > 0) refs.current[idx - 1]?.focus();
    else if   (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? "");
    commit(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-12 h-14 shrink-0 text-center text-xl font-extrabold rounded-xl border-2 outline-none caret-transparent transition focus:ring-4 focus:ring-primary/20 focus:border-primary focus:scale-[1.04] ${
            d ? "border-primary bg-primary/5 text-gray-900" : "border-gray-300 bg-gray-50 text-gray-900"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Verify({ loaderData, actionData }: Route.ComponentProps) {
  const navigation   = useNavigation();
  const submit       = useSubmit();
  const isSubmitting = navigation.state === "submitting";
  const { email, firstName } = loaderData;
  const [code, setCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);
  const filled = code.replace(/[^0-9]/g, "").length === 6;

  // Auto-submit once when all 6 digits are entered; reset if user clears a digit
  useEffect(() => {
    if (!filled) {
      autoSubmitted.current = false;
      return;
    }
    if (autoSubmitted.current || isSubmitting) return;
    autoSubmitted.current = true;
    submit(formRef.current);
  }, [filled, isSubmitting]);

  return (
    <div className="flex-1">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Check your email</h1>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-800">{email}</span>
        </p>
      </div>

      {/* ── Alerts ── */}
      {actionData?.resent && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          New code sent — check your inbox.
        </div>
      )}
      {actionData?.error && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionData.error}
        </div>
      )}

      {/* ── Form ── */}
      <Form ref={formRef} method="post" className="space-y-6">
        <input type="hidden" name="code" value={code} />

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Enter 6-digit code
          </p>
          <OtpBoxes value={code} onChange={setCode} />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i < code.replace(/[^0-9]/g, "").length ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !filled}
          className="w-full py-3.5 px-4 font-bold rounded-xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying…
            </>
          ) : (
            <>
              Verify account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </Form>

      {/* ── Resend ── */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Didn't receive it?{" "}
        <Form method="post" className="inline">
          <input type="hidden" name="intent" value="resend" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-40"
          >
            Resend code
          </button>
        </Form>
      </p>
    </div>
  );
}
