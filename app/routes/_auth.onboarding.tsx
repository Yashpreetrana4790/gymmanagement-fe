import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.onboarding";

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const session = await requireSession(request);
  const stage = session.get("stage");

  if (stage === "registered") throw redirect("/verify");
  if (stage === "onboarded") throw redirect("/");

  return { firstName: session.get("firstName") ?? "" };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession, commitSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();

  const result = await api.post<{ data: unknown }>(
    "/api/gym-profile",
    {
      gymName: form.get("gymName"),
      strength: Number(form.get("strength")),
      city: form.get("city"),
      state: form.get("state"),
      address: form.get("address"),
      pincode: form.get("pincode"),
      phone: form.get("phone"),
      email: form.get("email"),
    },
    token
  );

  if (!result.success) {
    return { error: result.message ?? "Failed to create gym profile." };
  }

  session.set("stage", "onboarded");

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Onboarding({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { firstName } = loaderData;

  return (
    <div>
      <div className="mb-8">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Set up your gym</h1>
        <p className="mt-2 text-gray-500">
          Great work, {firstName}! Just a few details about your gym to get started.
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="gymName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Gym name <span className="text-red-500">*</span>
          </label>
          <input
            id="gymName"
            name="gymName"
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g. Iron Paradise Gym"
          />
        </div>

        <div>
          <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-1.5">
            Gym capacity (members) <span className="text-red-500">*</span>
          </label>
          <input
            id="strength"
            name="strength"
            type="number"
            required
            min={1}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g. 200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Mumbai"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1.5">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Maharashtra"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="123, Main Street, Andheri West"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1.5">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="400053"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Gym contact
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Creating gym profile…" : "Create gym profile →"}
        </button>
      </Form>
    </div>
  );
}
