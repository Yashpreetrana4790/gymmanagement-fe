import { Form, Link, redirect, useNavigation, useActionData } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/_auth.login";
import { loginSchema, parseErrors, type FieldErrors } from "~/lib/validations";
import { toast } from "~/components/Toast";

export async function loader({ request }: Route.LoaderArgs) {
  const { redirectIfAuthenticated } = await import("~/lib/session.server");
  await redirectIfAuthenticated(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { getSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();

  const raw = {
    email:    (form.get("email")    as string) ?? "",
    password: (form.get("password") as string) ?? "",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fields: parseErrors(parsed.error) as FieldErrors, error: null };
  }

  const result = await api.post<{
    token: string;
    stage: string;
    user: { firstName: string; email: string };
  }>("/api/auth/login", parsed.data);

  if (!result.success) {
    return { error: result.message ?? "Login failed.", fields: null };
  }

  const session = await getSession(request);
  session.set("token", result.token!);
  session.set("stage", result.stage as "registered" | "verified" | "onboarded");
  session.set("email", result.user!.email);
  session.set("firstName", result.user!.firstName);

  const destination =
    result.stage === "registered" ? "/verify"
    : result.stage === "verified"  ? "/onboarding"
    : "/";

  return redirect(destination, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation  = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const fields = (actionData as any)?.fields as FieldErrors | null;
  const error  = (actionData as any)?.error  as string  | null;

  useEffect(() => {
    if (error) toast("error", error);
  }, [error, actionData]);

  return (
    <div className="flex-1">
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#c2410c" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: "#f97316" }} />
          Secure · Encrypted · Private
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your GymManager account</p>
      </div>

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email"
            placeholder="you@yourgym.com"
            className={`auth-input ${fields?.email ? "!border-red-400" : ""}`} />
          <FieldError msg={fields?.email} />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1.5 text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password"
            placeholder="Enter your password"
            className={`auth-input ${fields?.password ? "!border-red-400" : ""}`} />
          <FieldError msg={fields?.password} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 font-bold rounded-xl text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1"
          style={{
            background: isSubmitting
              ? "rgba(249,115,22,0.5)"
              : "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
            boxShadow: isSubmitting ? "none" : "0 4px 15px rgba(249,115,22,0.4), 0 2px 6px rgba(0,0,0,0.1)",
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
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
          ) : (
            <>
              Sign in
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </Form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-orange-600 hover:text-orange-500 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}
