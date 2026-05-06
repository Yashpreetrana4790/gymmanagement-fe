import { Link, useSearchParams } from "react-router";
import type { Route } from "./+types/_app.zombies";

type ZombieMember = {
  _id: string;
  user: { firstName: string; lastName: string; email: string; phone?: string };
  membershipType: string;
  membershipEnd: string;
  totalVisits: number;
  lastVisit: string | null;
  daysSinceVisit: number | null;
  daysSinceJoined: number;
  neverVisited: boolean;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const url = new URL(request.url);
  const days = url.searchParams.get("days") ?? "30";

  const result = await api.get<{
    data: { zombies: ZombieMember[]; total: number; neverVisited: number; days: number };
  }>(`/api/members/zombies?days=${days}`, token);

  return {
    zombies: result.data?.zombies ?? [],
    total: result.data?.total ?? 0,
    neverVisited: result.data?.neverVisited ?? 0,
    days: result.data?.days ?? Number(days),
  };
}

const PLAN_BADGE: Record<string, string> = {
  premium:  "bg-amber-100 text-amber-700 border border-amber-200",
  standard: "bg-primary/10 text-primary border border-primary/20",
  basic:    "bg-gray-100 text-gray-600 border border-gray-200",
};

function riskLevel(z: ZombieMember): { label: string; cls: string } {
  if (z.neverVisited) return { label: "Never visited", cls: "bg-red-100 text-red-700 border border-red-200" };
  const d = z.daysSinceVisit ?? 0;
  if (d >= 60) return { label: `${d}d absent`, cls: "bg-red-100 text-red-700 border border-red-200" };
  if (d >= 30) return { label: `${d}d absent`, cls: "bg-amber-100 text-amber-700 border border-amber-200" };
  return { label: `${d}d absent`, cls: "bg-primary/10 text-primary border border-primary/20" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const DAY_OPTIONS = [7, 14, 30, 60, 90];

export default function Zombies({ loaderData }: Route.ComponentProps) {
  const { zombies, total, neverVisited, days } = loaderData;
  const [, setSearchParams] = useSearchParams();

  const activeCount = total - neverVisited;
  const worstAbsence = zombies.find((z) => !z.neverVisited)?.daysSinceVisit ?? 0;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Zombie Members</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
              {total}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Active members with no check-in in the last {days} days
          </p>
        </div>

        {/* Day threshold picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Inactive for</span>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSearchParams({ days: String(d) })}
                className={`px-3.5 py-2 text-xs font-semibold transition ${
                  days === d
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d}d+
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-5">
        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total zombies", value: total, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
            { label: "Never visited", value: neverVisited, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
            { label: "Gone inactive", value: activeCount, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Longest absence", value: worstAbsence ? `${worstAbsence}d` : "—", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {zombies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">No zombie members!</p>
              <p className="text-xs text-gray-400 mt-1">All active members have visited in the last {days} days.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Visits</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Check-in</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {zombies.map((z, i) => {
                    const risk = riskLevel(z);
                    return (
                      <tr key={z._id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: "linear-gradient(135deg,#fecaca,#fca5a5)", color: "#b91c1c" }}
                            >
                              {z.user.firstName[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{z.user.firstName} {z.user.lastName}</p>
                              <p className="text-xs text-gray-400">{z.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_BADGE[z.membershipType] ?? "bg-gray-100 text-gray-600"}`}>
                            {z.membershipType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 font-medium text-xs">
                          {z.totalVisits === 0 ? (
                            <span className="text-red-400 font-semibold">0 visits</span>
                          ) : z.totalVisits}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {z.lastVisit ? formatDate(z.lastVisit) : (
                            <span className="text-red-400 font-semibold italic">Never</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(z.membershipEnd)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${risk.cls}`}>
                            {risk.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/members/${z._id}`}
                            className="text-xs font-medium text-gray-500 hover:text-primary transition px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
