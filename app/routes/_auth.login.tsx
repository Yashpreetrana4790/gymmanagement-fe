import { Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.login";

export async function loader({ request }: Route.LoaderArgs) {
  const { redirectIfAuthenticated } = await import("~/lib/session.server");
  await redirectIfAuthenticated(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { getSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const result = await api.post<{
    token: string;
    stage: string;
    user: { firstName: string; email: string };
  }>("/api/auth/login", { email, password });

  if (!result.success) {
    return { error: result.message ?? "Login failed." };
  }

  const session = await getSession(request);
  session.set("token", result.token!);
  session.set("stage", result.stage as "registered" | "verified" | "onboarded");
  session.set("email", result.user!.email);
  session.set("firstName", result.user!.firstName);

  const stage = result.stage;
  const destination =
    stage === "registered" ? "/verify" : stage === "verified" ? "/onboarding" : "/";

  return redirect(destination, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#f8fafc",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  };

  return (
    <div className="flex-1">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          Secure · Encrypted · Private
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
        <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
          Sign in to your GymManager account
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2"
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
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: "#cbd5e1" }}>Email Address</label>
          <input id="email" name="email" type="email" required autoComplete="email"
            placeholder="john@yourgym.com" style={inputStyle} className="auth-input" />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: "#cbd5e1" }}>Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password"
            placeholder="Enter your password" style={inputStyle} className="auth-input" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 font-bold rounded-xl text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 mt-1"
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
              Signing in…
            </>
          ) : "SIGN IN"}
        </button>
      </Form>

      <p className="mt-6 text-center text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold transition" style={{ color: "#a5b4fc" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#c7d2fe")}
          onMouseLeave={e => (e.currentTarget.style.color = "#a5b4fc")}>
          Create one free
        </Link>
      </p>

      <style>{`
        .auth-input::placeholder { color: rgba(148,163,184,0.4); }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 12px rgba(99,102,241,0.1);
        }
        .auth-input:hover { border-color: rgba(255,255,255,0.2) !important; }
      `}</style>
    </div>
  );
}
