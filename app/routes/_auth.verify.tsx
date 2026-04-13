import { Form, redirect, useNavigation, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/_auth.verify";
import { api } from "~/lib/api.server";
import { getSession, commitSession, requireSession } from "~/lib/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const stage = session.get("stage");

  // Already verified — skip ahead
  if (stage === "verified") throw redirect("/onboarding");
  if (stage === "onboarded") throw redirect("/");

  return {
    email: session.get("email") ?? "",
    firstName: session.get("firstName") ?? "",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  // Resend OTP
  if (intent === "resend") {
    const result = await api.post("/api/auth/resend-otp", {}, token);
    if (!result.success) return { error: result.message, resent: false };
    return { resent: true, error: null };
  }

  // Verify OTP
  const code = form.get("code") as string;
  const result = await api.post<{ token: string; stage: string; user: { firstName: string; email: string } }>(
    "/api/auth/verify-otp",
    { code },
    token
  );

  if (!result.success) {
    return { error: result.message ?? "Invalid OTP.", resent: false };
  }

  // Refresh session with new token + stage
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
    <div>
      <div className="mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-2 text-gray-500">
          Hi {firstName}! We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email}</span>. Enter it below to verify
          your account.
        </p>
      </div>

      {actionData?.resent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          A new code has been sent to your email.
        </div>
      )}

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Verifying…" : "Verify account"}
        </button>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          <Form method="post" className="inline">
            <input type="hidden" name="intent" value="resend" />
            <button
              type="submit"
              className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Resend code
            </button>
          </Form>
        </p>
      </div>
    </div>
  );
}
