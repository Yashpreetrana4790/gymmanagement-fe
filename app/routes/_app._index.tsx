import { Link } from "react-router";
import type { Route } from "./+types/_app._index";
import { api } from "~/lib/api.server";
import { requireSession } from "~/lib/session.server";

type MemberDoc = {
  _id: string;
  user: { firstName: string; lastName: string; email: string };
  membershipType: string;
  membershipEnd: string;
  createdAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request);
  const token = session.get("token")!;
  const firstName = session.get("firstName") ?? "there";

  const [membersRes, plansRes] = await Promise.all([
    api.get<{ count: number; data: MemberDoc[] }>("/api/members", token),
    api.get<{ count: number }>("/api/plans", token),
  ]);

  const recentMembers = (membersRes.data ?? []).slice(0, 5).map((m) => ({
    name: `${m.user.firstName} ${m.user.lastName}`.trim(),
    plan: m.membershipType,
    joinedAt: m.createdAt,
  }));

  return {
    firstName,
    stats: {
      totalMembers: membersRes.count ?? 0,
      activePlans: plansRes.count ?? 0,
      monthlyRevenue: 0,
      attendance: 0,
    },
    recentMembers,
  };
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
          {icon}
        </div>
      </div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function QuickActionCard({
  label,
  description,
  href,
  accent,
  icon,
}: {
  label: string;
  description: string;
  href: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { stats, firstName, recentMembers } = loaderData;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      label: "Total Members",
      value: stats.totalMembers,
      sub: stats.totalMembers === 0 ? "Add your first member to get started" : "Registered members",
      accent: "bg-blue-50 text-blue-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Active Plans",
      value: stats.activePlans,
      sub: stats.activePlans === 0 ? "Create membership plans to sell" : "Membership plans available",
      accent: "bg-emerald-50 text-emerald-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`,
      sub: "Track payments to see revenue",
      accent: "bg-amber-50 text-amber-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Today's Check-ins",
      value: stats.attendance,
      sub: "Attendance tracking coming soon",
      accent: "bg-violet-50 text-violet-600",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      label: "Add Member",
      description: "Register a new gym member",
      href: "/members",
      accent: "bg-blue-600 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: "Create Plan",
      description: "Define a new membership plan",
      href: "/plans",
      accent: "bg-emerald-600 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      label: "Manage Staff",
      description: "Add trainers and front desk",
      href: "/staff",
      accent: "bg-slate-700 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: "Record Payment",
      description: "Log a membership payment",
      href: "/payments",
      accent: "bg-amber-500 text-white",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const features = [
    {
      title: "Member Management",
      description: "Track profiles, contact info, membership status, and attendance history for every member.",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-blue-50",
    },
    {
      title: "Flexible Plans",
      description: "Create monthly, quarterly, or annual plans. Set pricing, duration, and perks for each tier.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: "bg-emerald-50",
    },
    {
      title: "Payment Tracking",
      description: "Record fees collected, dues pending, and generate payment receipts for every transaction.",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "bg-amber-50",
    },
    {
      title: "Staff Management",
      description: "Onboard trainers, assign roles, and track staff schedules across departments.",
      icon: (
        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-violet-50",
    },
  ];

  return (
    <div className="min-h-full">
      {/* Top header bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" suppressHydrationWarning>{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            System online
          </span>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Getting started banner — shown when no members */}
        {stats.totalMembers === 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-8 text-white">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)" }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 rounded-full px-3 py-1 text-blue-300 text-xs font-semibold mb-4">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Getting started
              </div>
              <h2 className="text-2xl font-bold mb-2">Set up your gym in minutes</h2>
              <p className="text-slate-300 text-sm max-w-xl mb-6">
                Welcome to GymManager. Create your membership plans, add your first members, and start tracking payments — all from one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/plans"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create first plan
                </Link>
                <Link
                  to="/members"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition border border-white/20"
                >
                  Add a member
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Quick actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.label} {...action} />
            ))}
          </div>
        </div>

        {/* Two-column: Recent members + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent members table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent members</h2>
              <Link to="/members" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                View all
              </Link>
            </div>
            {recentMembers.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Plan</th>
                    <th className="px-6 py-3 text-left font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentMembers.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {m.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="font-medium text-gray-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          {m.plan ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs">
                        {m.joinedAt
                          ? new Date(m.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No members yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first member to see them here.</p>
                <Link
                  to="/members"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Add member
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* At-a-glance panel */}
          <div className="flex flex-col gap-4">
            {/* Revenue placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Revenue this month</h3>
              <p className="text-3xl font-bold text-gray-900">₹0</p>
              <p className="text-xs text-gray-400 mt-1">Start recording payments to track revenue</p>
              <div className="mt-4 h-1.5 rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-amber-400 w-0" />
              </div>
              <p className="text-xs text-gray-400 mt-2">₹0 of monthly target</p>
            </div>

            {/* Expiring soon placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Expiring soon</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-xs text-gray-400">Memberships expiring in the next 7 days will appear here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">What you can do with GymManager</h2>
          <p className="text-sm text-gray-400 mb-5">Everything you need to run your gym — in one dashboard.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
