import { Link, useOutletContext } from "react-router";
import { useMemo } from "react";
import type { Route } from "./+types/_app._index";

const todayMD = (d: Date) => `${d.getMonth()}-${d.getDate()}`;

type MemberDoc = {
  _id: string;
  user: { firstName: string; lastName: string; email: string; dateOfBirth?: string };
  membershipType: string;
  membershipEnd: string;
  isActive: boolean;
  createdAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const firstName = session.get("firstName") ?? "there";

  const [membersRes, plansRes, statsRes] = await Promise.all([
    api.get<{ count: number; data: MemberDoc[] }>("/api/members", token),
    api.get<{ count: number }>("/api/plans", token),
    api.get<{ data: { breakdown: { _id: string; count: number; active: number }[]; plans: { _id: string; name: string; price: number }[] } }>("/api/plans/stats", token),
  ]);

  const members: MemberDoc[] = membersRes.data ?? [];
  const now = new Date();

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeTrainees = members.filter(
    (m) => m.isActive && new Date(m.membershipEnd) >= now
  ).length;

  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();
  const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

  const newThisMonth = members.filter((m) => {
    const d = new Date(m.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const newLastMonth = members.filter((m) => {
    const d = new Date(m.createdAt);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  }).length;

  const monthlyGrowth =
    newLastMonth === 0
      ? newThisMonth > 0 ? 100 : 0
      : Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100);

  // ── Birthdays (today + next 30 days) ───────────────────────────────────────
  const upcomingDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return todayMD(d);
  });

  const todayMidnight = new Date(thisYear, now.getMonth(), now.getDate());

  const birthdays = members
    .filter((m) => {
      if (!m.user.dateOfBirth) return false;
      const dob = new Date(m.user.dateOfBirth);
      return upcomingDates.includes(todayMD(dob));
    })
    .map((m) => {
      const dob = new Date(m.user.dateOfBirth!);
      const upcoming = new Date(thisYear, dob.getMonth(), dob.getDate());
      if (upcoming < todayMidnight) upcoming.setFullYear(thisYear + 1);
      const diffDays = Math.round((upcoming.getTime() - todayMidnight.getTime()) / 86400000);
      return {
        name: `${m.user.firstName} ${m.user.lastName}`.trim(),
        dob: m.user.dateOfBirth!,
        daysUntil: diffDays,
      };
    })
    .filter((b) => b.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // ── Expiring soon (next 7 days) ─────────────────────────────────────────────
  const expiringSoon = members
    .filter((m) => {
      const end = new Date(m.membershipEnd);
      const diff = (end.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 7;
    })
    .map((m) => ({
      name: `${m.user.firstName} ${m.user.lastName}`.trim(),
      membershipEnd: m.membershipEnd,
      membershipType: m.membershipType,
    }))
    .sort((a, b) => new Date(a.membershipEnd).getTime() - new Date(b.membershipEnd).getTime());

  const recentMembers = members.slice(0, 5).map((m) => ({
    name: `${m.user.firstName} ${m.user.lastName}`.trim(),
    plan: m.membershipType,
    joinedAt: m.createdAt,
  }));

  return {
    firstName,
    stats: {
      totalMembers:   members.length,
      activeTrainees,
      newThisMonth,
      monthlyGrowth,
      activePlans:    plansRes.count ?? 0,
    },
    recentMembers,
    birthdays,
    expiringSoon,
    planBreakdown: statsRes.data?.breakdown ?? [],
    plansList: statsRes.data?.plans ?? [],
  };
}

// ─── Quick action definitions (module-level — JSX created once) ──────────────

const ALL_QUICK_ACTIONS = [
  {
    label: "Add Member",
    description: "Register a new gym member",
    href: "/members",
    accent: "bg-orange-500 text-white",
    adminOnly: false,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  },
  {
    label: "Create Plan",
    description: "Define a new membership plan",
    href: "/plans",
    accent: "bg-emerald-600 text-white",
    adminOnly: false,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  },
  {
    label: "Manage Staff",
    description: "Add trainers and front desk",
    href: "/staff",
    accent: "bg-slate-700 text-white",
    adminOnly: false,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    label: "Record Payment",
    description: "Log a membership payment",
    href: "/payments",
    accent: "bg-amber-500 text-white",
    adminOnly: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subColor,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  const hasTrend = sub?.includes("%");
  const isUp   = hasTrend && sub!.startsWith("+");
  const isDown = hasTrend && sub!.startsWith("-") && !sub!.startsWith("-0");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {hasTrend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
            isUp   ? "bg-emerald-50 text-emerald-600"
            : isDown ? "bg-red-50 text-red-500"
            : "bg-gray-100 text-gray-500"
          }`}>
            {isUp && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7 7 7" /></svg>}
            {isDown && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7-7-7" /></svg>}
            {sub}
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl font-black text-gray-900 leading-none tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-1.5">{label}</p>
        {sub && !hasTrend && (
          <p className={`text-xs mt-1 ${subColor ?? "text-gray-400"}`}>{sub}</p>
        )}
      </div>
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

// ─── Plan Popularity Chart ────────────────────────────────────────────────────

const PLAN_COLORS: Record<string, string> = {
  basic:    "#f97316",
  standard: "#3b82f6",
  premium:  "#8b5cf6",
};

function PlanPopularityChart({
  breakdown,
  plans,
}: {
  breakdown: { _id: string; count: number; active: number }[];
  plans: { _id: string; name: string; price: number }[];
}) {
  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">No member data yet.</p>
    );
  }

  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div className="space-y-4">
      {/* Bars */}
      <div className="space-y-3">
        {breakdown.map((b) => {
          const color = PLAN_COLORS[b._id] ?? "#6b7280";
          const pct = Math.round((b.count / maxCount) * 100);
          const activePct = b.count > 0 ? Math.round((b.active / b.count) * 100) : 0;
          return (
            <div key={b._id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-sm font-medium text-gray-700 capitalize">{b._id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">{b.active} active</span>
                  <span className="font-bold text-gray-800">{b.count} total</span>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <div className="mt-1 text-[10px] text-gray-400 text-right">{activePct}% active</div>
            </div>
          );
        })}
      </div>

      {/* Plan legend */}
      {plans.length > 0 && (
        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 gap-2">
          {plans.map((p) => (
            <div key={p._id} className="flex items-center justify-between text-xs">
              <span className="text-gray-500 truncate">{p.name}</span>
              <span className="font-semibold text-gray-700 shrink-0">₹{p.price.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { stats, firstName, recentMembers, birthdays, expiringSoon, planBreakdown, plansList } = loaderData;
  const { role } = useOutletContext<{ role: string; staffRole: string }>();
  const isAdmin = role === "admin";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statCards = [
    {
      label: "Active Trainees",
      value: stats.activeTrainees,
      sub: stats.activeTrainees === 0 ? "No active memberships yet" : "Currently active",
      subColor: "text-gray-400",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      label: "New this month",
      value: stats.newThisMonth,
      sub: stats.newThisMonth === 0
        ? "No new members yet"
        : isAdmin
          ? stats.monthlyGrowth > 0  ? `+${stats.monthlyGrowth}% vs last month`
            : stats.monthlyGrowth < 0 ? `${stats.monthlyGrowth}% vs last month`
            : "Same as last month"
          : `${stats.newThisMonth} joined this month`,
      subColor: isAdmin
        ? stats.monthlyGrowth > 0 ? "text-emerald-600"
          : stats.monthlyGrowth < 0 ? "text-red-500"
          : "text-gray-400"
        : "text-gray-400",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    },
    {
      label: "Active Plans",
      value: stats.activePlans,
      sub: stats.activePlans === 0 ? "Create membership plans" : "Plans available",
      subColor: "text-gray-400",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    },
    {
      label: "Total Members",
      value: stats.totalMembers,
      sub: stats.totalMembers === 0 ? "Add your first member" : "All time registered",
      subColor: "text-gray-400",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  const quickActions = useMemo(
    () => ALL_QUICK_ACTIONS.filter(a => !a.adminOnly || isAdmin),
    [isAdmin]
  );

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" suppressHydrationWarning>{today}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          System online
        </span>
      </div>

      <div className="p-8 space-y-8">

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Getting started banner */}
        {stats.totalMembers === 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-2xl p-8 border border-orange-100">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%)" }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-3 py-1 text-orange-700 text-xs font-semibold mb-4">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Getting started
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your gym in minutes</h2>
              <p className="text-gray-600 text-sm max-w-xl mb-6">
                Welcome to Gravity Gym. Create membership plans, add your first members, and start tracking payments — all from one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/plans"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                  Create first plan
                </Link>
                <Link to="/members"
                  className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-xl transition border border-orange-200">
                  Add a member
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickActionCard key={action.label} {...action} />
            ))}
          </div>
        </div>

        {/* Plan popularity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Plan popularity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Member distribution by membership type</p>
            </div>
            <Link to="/plans" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
              Manage plans
            </Link>
          </div>
          <PlanPopularityChart breakdown={planBreakdown} plans={plansList} />
        </div>

        {/* Three-column: Recent members + Birthday + Expiring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent members */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent members</h2>
              <Link to="/members" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
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
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {m.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="font-medium text-gray-800">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 capitalize">
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
                <Link to="/members"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600">
                  Add member
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Birthdays widget */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎂</span>
                <h3 className="text-sm font-semibold text-gray-900">Upcoming birthdays</h3>
                {birthdays.length > 0 && (
                  <span className="ml-auto bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {birthdays.length}
                  </span>
                )}
              </div>

              {birthdays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <p className="text-xs text-gray-400">No birthdays in the next 30 days.</p>
                  <p className="text-xs text-gray-300 mt-1">Add member DOBs to see them here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {birthdays.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {b.name[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(b.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      {b.daysUntil === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-pink-50 text-pink-600 border border-pink-200">
                          🎂 Today
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-pink-50 text-pink-600">
                          In {b.daysUntil}d
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiring soon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Expiring soon</h3>
                {expiringSoon.length > 0 && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {expiringSoon.length}
                  </span>
                )}
              </div>

              {expiringSoon.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No memberships expiring in the next 7 days.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {expiringSoon.map((m, i) => {
                    const daysLeft = Math.ceil(
                      (new Date(m.membershipEnd).getTime() - Date.now()) / 86400000
                    );
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {m.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{m.membershipType}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          daysLeft <= 1 ? "bg-red-100 text-red-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
