import { Form, Link, redirect, useNavigation, useActionData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/_auth.reset-password";

export async function loader({ request }: Route.LoaderArgs) {
  const { redirectIfAuthenticated } = await import("~/lib/session.server");
  await redirectIfAuthenticated(request);
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  return { email };
}

export async function action({ request }: Route.ActionArgs) {
  const { api } = await import("~/lib/api.server");
  const form = await request.formData();
  const email       = (form.get("email")       as string) ?? "";
  const code        = (form.get("code")        as string) ?? "";
  const newPassword = (form.get("newPassword") as string) ?? "";
  const confirm     = (form.get("confirm")     as string) ?? "";

  if (newPassword !== confirm) return { error: "Passwords do not match." };
  if (newPassword.length < 6)  return { error: "Password must be at least 6 characters." };

  const res = await api.post<Record<string, never>>("/api/auth/reset-password", { email, code, newPassword });
  if (!res.success) return { error: res.message ?? "Reset failed." };

  throw redirect("/login?reset=1");
}

export default function ResetPassword({ loaderData }: Route.ComponentProps) {
  const { email }    = loaderData;
  const navigation   = useNavigation();
  const actionData   = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="flex-1">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-primary/10 border border-primary/20">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{email}</span>
        </p>
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
        <input type="hidden" name="email" value={email} />

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Reset code <span className="text-red-500">*</span>
          </label>
          <input
            name="code" type="text" required autoFocus
            maxLength={6} inputMode="numeric" placeholder="123456"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition tracking-[0.4em] text-center font-mono text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            New password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="newPassword" type={showPw ? "text" : "password"} required
              minLength={6} placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              }
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-gray-700">
            Confirm new password <span className="text-red-500">*</span>
          </label>
          <input
            name="confirm" type="password" required
            minLength={6} placeholder="Repeat password"
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
              Resetting…
            </>
          ) : (
            <>
              Reset password
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </Form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Didn't get a code?{" "}
        <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Resend
        </Link>
      </p>
    </div>
  );
}
