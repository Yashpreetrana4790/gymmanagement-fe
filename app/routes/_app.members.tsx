import { Form, useNavigation } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/_app.members";
import { api } from "~/lib/api.server";
import { requireSession } from "~/lib/session.server";

type Member = {
  _id: string;
  user: { firstName: string; lastName: string; email: string; phone?: string };
  membershipType: "basic" | "standard" | "premium";
  membershipStart: string;
  membershipEnd: string;
  isActive: boolean;
  createdAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const result = await api.get<{ data: Member[]; count: number }>("/api/members", token);
  return { members: result.data ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    const result = await api.post("/api/members", {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone"),
      membershipType: form.get("membershipType"),
      membershipEnd: form.get("membershipEnd"),
    }, token);
    return { intent: "create", success: result.success, error: result.success ? null : (result.message ?? "Failed to add member.") };
  }

  if (intent === "delete") {
    const id = form.get("id") as string;
    const result = await api.delete(`/api/members/${id}`, token);
    return { intent: "delete", success: result.success, error: result.success ? null : (result.message ?? "Failed to delete member.") };
  }

  return null;
}

const TYPE_BADGE: Record<string, string> = {
  premium: "bg-amber-100 text-amber-700",
  standard: "bg-blue-100 text-blue-700",
  basic: "bg-gray-100 text-gray-600",
};

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

export default function Members({ loaderData, actionData }: Route.ComponentProps) {
  const { members } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showForm, setShowForm] = useState(false);

  // Close form and reset on successful create
  useEffect(() => {
    if (actionData?.intent === "create" && actionData?.success) {
      setShowForm(false);
    }
  }, [actionData]);

  const activeCount = members.filter((m) => !isExpired(m.membershipEnd) && m.isActive).length;
  const expiredCount = members.filter((m) => isExpired(m.membershipEnd)).length;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-400 mt-0.5">{members.length} total member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? "Cancel" : "Add member"}
        </button>
      </div>

      <div className="p-8 space-y-6">
        {/* Error banner */}
        {actionData?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {actionData.error}
          </div>
        )}

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: activeCount, color: "text-emerald-600" },
            { label: "Expired", value: expiredCount, color: "text-red-500" },
            { label: "Premium", value: members.filter((m) => m.membershipType === "premium").length, color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Inline add member form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">New member details</h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name <span className="text-red-500">*</span></label>
                  <input name="firstName" required type="text" placeholder="John" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name <span className="text-red-500">*</span></label>
                  <input name="lastName" required type="text" placeholder="Doe" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input name="email" required type="email" placeholder="john@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input name="phone" type="tel" placeholder="+91 98765 43210" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Membership type</label>
                  <select name="membershipType" className={inputCls}>
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Membership expires <span className="text-red-500">*</span></label>
                  <input name="membershipEnd" required type="date" className={inputCls}
                    min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition"
                >
                  {isSubmitting ? "Adding…" : "Add member"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
                  Cancel
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Members table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-500">No members yet</p>
              <p className="text-sm mt-1 text-gray-400">Click "Add member" above to get started.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => {
                  const expired = isExpired(member.membershipEnd);
                  const name = `${member.user.firstName} ${member.user.lastName}`.trim();
                  return (
                    <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                            {name[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-gray-400 text-xs">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{member.user.phone ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_BADGE[member.membershipType]}`}>
                          {member.membershipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(member.membershipEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${expired ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Form method="post" onSubmit={(e) => { if (!confirm(`Remove ${name}?`)) e.preventDefault(); }}>
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={member._id} />
                          <button
                            type="submit"
                            className="text-xs text-gray-400 hover:text-red-600 transition font-medium"
                          >
                            Remove
                          </button>
                        </Form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}
