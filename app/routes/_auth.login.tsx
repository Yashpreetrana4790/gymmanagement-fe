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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-gray-500">Sign in to your GymManager account.</p>
      </div>

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="john@yourgym.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
          Create one free
        </Link>
      </p>
    </div>
  );
}
