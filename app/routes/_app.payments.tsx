import type { Route } from "./+types/_app.payments";

type Payment = {
  _id: string;
  member: { name: string; email: string };
  plan: { name: string };
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  await requireSession(request);
  // Placeholder — payments endpoint to be built
  return { payments: [] as Payment[], summary: { totalCollected: 0, pending: 0, overdue: 0 } };
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  overdue: "bg-red-50 text-red-600",
};

export default function Payments({ loaderData }: Route.ComponentProps) {
  const { payments, summary } = loaderData;

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track membership payments and dues.</p>
      </div>
    <div className="p-8">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Collected this month",
            value: `₹${summary.totalCollected.toLocaleString("en-IN")}`,
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Pending",
            value: `₹${summary.pending.toLocaleString("en-IN")}`,
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Overdue",
            value: `₹${summary.overdue.toLocaleString("en-IN")}`,
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
            color: "bg-red-50 text-red-600",
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Transaction history</h2>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="font-medium">No payments recorded</p>
            <p className="text-sm mt-1">Payments will appear here once members are added.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.member.name}</p>
                    <p className="text-gray-400 text-xs">{p.member.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{p.plan.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(p.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[p.status]}`}>
                      {p.status}
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
