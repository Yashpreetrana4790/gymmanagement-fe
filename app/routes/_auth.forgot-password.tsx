import { Form, Link, redirect, useNavigation, useActionData } from "react-router";
import type { Route } from "./+types/_auth.forgot-password";

export async function loader({ request }: Route.LoaderArgs) {
  const { redirectIfAuthenticated } = await import("~/lib/session.server");
  await redirectIfAuthenticated(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();
  const email = (form.get("email") as string) ?? "";

  if (!email) return { error: "Email is required.", sent: false };

  const res = await api.post<Record<string, never>>("/api/auth/forgot-password", { email });
  if (!res.success) return { error: res.message ?? "Something went wrong.", sent: false };

  throw redirect(`/reset-password?email=${encodeURIComponent(email)}`);
}

export default function ForgotPassword() {
  const navigation  = useNavigation();
  const actionData  = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex-1">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500">Enter your email and we'll send you a reset code.</p>
      </div>

      {(actionData as any)?.error && (
        <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {(actionData as any).error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email" name="email" type="email" required autoFocus
            autoComplete="email" placeholder="you@yourgym.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 font-bold rounded-xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              Send reset code
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
