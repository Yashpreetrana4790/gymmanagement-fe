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
    <label className="block text-sm font-semibold mb-1.5 text-slate-700">
      {children}
    </label>
  );
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#f97316" }} />
          Free forever · No credit card needed
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Get Started Now</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your details to create your account
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2.5"
          style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
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
            <Label>First Name <span className="text-red-400">*</span></Label>
            <input name="firstName" required type="text" autoComplete="given-name"
              placeholder="John" className="auth-input" />
          </div>
          <div>
            <Label>Last Name</Label>
            <input name="lastName" type="text" autoComplete="family-name"
              placeholder="Doe" className="auth-input" />
          </div>
        </div>

        <div>
          <Label>Phone Number</Label>
          <input name="phone" required type="tel" autoComplete="tel"
            placeholder="+91 98765 43210" className="auth-input" />
        </div>

        <div>
          <Label>Email Address <span className="text-red-400">*</span></Label>
          <input name="email" required type="email" autoComplete="email"
            placeholder="john@gmail.com" className="auth-input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Password <span className="text-red-400">*</span></Label>
            <input name="password" required type="password" autoComplete="new-password"
              placeholder="Min. 6 chars" className="auth-input" />
          </div>
          <div>
            <Label>Confirm Password <span className="text-red-400">*</span></Label>
            <input name="confirmPassword" required type="password" autoComplete="new-password"
              placeholder="Re-enter" className="auth-input" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 font-bold rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: isSubmitting
              ? "rgba(249,115,22,0.5)"
              : "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
            boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(249,115,22,0.4), 0 2px 6px rgba(0,0,0,0.1)",
            opacity: isSubmitting ? 0.7 : 1,
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
          ) : (
            <>
              Create account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </Form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
