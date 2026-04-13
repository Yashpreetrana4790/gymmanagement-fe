import { Form, useNavigation, Link } from "react-router";
import type { Route } from "./+types/_app.plans";
import { api } from "~/lib/api.server";
import { requireSession } from "~/lib/session.server";

type Plan = {
  _id: string;
  name: string;
  type: "basic" | "standard" | "premium";
  durationDays: number;
  price: number;
  features: string[];
  isActive: boolean;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const result = await api.get<{ data: Plan[] }>("/api/plans", token);
  return { plans: result.data ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    const result = await api.post<{ data: Plan }>("/api/plans", {
      name: form.get("name"),
      type: form.get("type"),
      durationDays: Number(form.get("durationDays")),
      price: Number(form.get("price")),
      features: (form.get("features") as string).split(",").map((f) => f.trim()).filter(Boolean),
    }, token);
    return { error: result.success ? null : result.message };
  }

  if (intent === "delete") {
    const id = form.get("id") as string;
    const result = await api.delete(`/api/plans/${id}`, token);
    return { error: result.success ? null : result.message };
  }

  return null;
}

const TYPE_STYLE: Record<string, string> = {
  premium: "border-amber-200 bg-amber-50",
  standard: "border-blue-200 bg-blue-50",
  basic: "border-gray-200 bg-white",
};
const TYPE_BADGE: Record<string, string> = {
  premium: "bg-amber-100 text-amber-700",
  standard: "bg-blue-100 text-blue-700",
  basic: "bg-gray-100 text-gray-600",
};

export default function Plans({ loaderData, actionData }: Route.ComponentProps) {
  const { plans } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Plans</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage membership plans for your gym.</p>
      </div>
    <div className="p-8">

      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionData.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {plans.length === 0 ? (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-medium">No plans yet</p>
            <p className="text-sm mt-1">Create your first membership plan below.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan._id} className={`rounded-2xl border-2 p-6 ${TYPE_STYLE[plan.type]}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[plan.type]}`}>
                    {plan.type}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{plan.name}</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{plan.price.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-sm text-gray-500 mb-3">{plan.durationDays} days</p>
              {plan.features.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Form method="post" onSubmit={(e) => { if (!confirm(`Deactivate "${plan.name}"?`)) e.preventDefault(); }}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={plan._id} />
                <button type="submit" className="text-xs text-gray-400 hover:text-red-600 transition font-medium mt-1">
                  Deactivate
                </button>
              </Form>
            </div>
          ))
        )}
      </div>

      {/* Create plan form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Create new plan</h2>
        <Form method="post" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="hidden" name="intent" value="create" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan name</label>
            <input name="name" required type="text" placeholder="e.g. Monthly Basic"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select name="type" required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white">
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (days)</label>
            <input name="durationDays" required type="number" min="1" placeholder="30"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
            <input name="price" required type="number" min="0" placeholder="999"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Features <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input name="features" type="text" placeholder="Unlimited classes, Locker room, Personal trainer"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <div className="sm:col-span-2">
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              {isSubmitting ? "Creating…" : "Create plan"}
            </button>
          </div>
        </Form>
      </div>
    </div>
    </div>
  );
}
