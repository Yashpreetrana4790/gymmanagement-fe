import { Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.signup";

export async function loader({ request }: Route.LoaderArgs) {
  const { redirectIfAuthenticated } = await import("~/lib/session.server");
  await redirectIfAuthenticated(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { getSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();
  const data = {
    firstName: form.get("firstName") as string,
    lastName: form.get("lastName") as string,
    email: form.get("email") as string,
    phone: form.get("phone") as string,
    password: form.get("password") as string,
    confirmPassword: form.get("confirmPassword") as string,
  };

  if (data.password !== data.confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const result = await api.post<{ token: string; stage: string; user: { firstName: string; email: string } }>(
    "/api/auth/register",
    { firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, password: data.password }
  );

  if (!result.success) {
    return { error: result.message ?? "Registration failed." };
  }

  const session = await getSession(request);
  session.set("token", result.token!);
  session.set("stage", result.stage as "registered");
  session.set("email", result.user!.email);
  session.set("firstName", result.user!.firstName);

  return redirect("/verify", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#cbd5e1" }}>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="auth-input"
      style={{
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
      }}
    />
  );
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-medium"
          style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          Free forever · No credit card needed
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Get Started Now</h1>
        <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
          Enter your credentials to create your account
        </p>
      </div>

      {/* Error */}
      {actionData?.error && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2.5"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name <span style={{ color: "#f87171" }}>*</span></Label>
            <Input name="firstName" required type="text" autoComplete="given-name" placeholder="John" />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input name="lastName" type="text" autoComplete="family-name" placeholder="Doe" />
          </div>
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input name="phone" required type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
        </div>

        <div>
          <Label>Email Address <span style={{ color: "#f87171" }}>*</span></Label>
          <Input name="email" required type="email" autoComplete="email" placeholder="john@gmail.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Password <span style={{ color: "#f87171" }}>*</span></Label>
            <Input name="password" required type="password" autoComplete="new-password" placeholder="Min. 6 chars" />
          </div>
          <div>
            <Label>Confirm Password <span style={{ color: "#f87171" }}>*</span></Label>
            <Input name="confirmPassword" required type="password" autoComplete="new-password" placeholder="Re-enter" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: isSubmitting
              ? "rgba(99,102,241,0.45)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6 50%, #06b6d4)",
            boxShadow: isSubmitting ? "none" : "0 0 28px rgba(99,102,241,0.35), 0 2px 12px rgba(0,0,0,0.3)",
            letterSpacing: "0.04em",
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating account…
            </>
          ) : "CREATE ACCOUNT"}
        </button>
      </Form>

      <p className="mt-5 text-center text-sm" style={{ color: "#64748b" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "#818cf8" }}>
          Sign In
        </Link>
      </p>

      <style>{`
        .auth-input::placeholder { color: #475569; }
        .auth-input:hover:not(:focus) {
          border-color: rgba(255,255,255,0.22) !important;
          background: rgba(255,255,255,0.09) !important;
        }
        .auth-input:focus {
          border-color: #6366f1 !important;
          background: rgba(99,102,241,0.08) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
      `}</style>
    </div>
  );
}
