import type { Route } from "./+types/_app.staff";
import { requireSession } from "~/lib/session.server";

type StaffMember = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  await requireSession(request);
  return { staff: [] as StaffMember[] };
}

export default function Staff({ loaderData }: Route.ComponentProps) {
  const { staff } = loaderData;

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Staff</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your gym staff and trainers.</p>
      </div>
    <div className="p-8">
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Staff management is coming soon. The backend endpoint is under development.
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Trainers", count: 0, color: "bg-blue-50 text-blue-600" },
          { label: "Managers", count: 0, color: "bg-purple-50 text-purple-600" },
          { label: "Receptionists", count: 0, color: "bg-emerald-50 text-emerald-600" },
        ].map((r) => (
          <div key={r.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={`text-2xl font-bold ${r.color.split(" ")[1]}`}>{r.count}</p>
            <p className="text-sm text-gray-500 mt-0.5">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="font-medium">No staff added yet</p>
            <p className="text-sm mt-1">Add trainers, managers and receptionists.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold">
                        {s.firstName[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-gray-500">{s.phone ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold capitalize">{s.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </div>
  );
}
