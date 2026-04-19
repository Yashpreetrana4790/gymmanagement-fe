import { useFetcher, useRevalidator } from "react-router";
import { useState, useMemo } from "react";
import type { Route } from "./+types/_app.attendance";

type AttendanceEntry = {
  memberId: string;
  memberName: string;
  memberEmail: string;
  membershipType: string;
  at: string;
  entryId: string;
};

type Member = {
  _id: string;
  user: { firstName: string; lastName: string; email: string };
  membershipType: string;
  isActive: boolean;
  membershipEnd: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const [attendanceResult, membersResult] = await Promise.all([
    api.get<{ data: { entries: AttendanceEntry[]; todayCount: number; total: number } }>(
      "/api/members/attendance/recent?limit=200",
      token
    ),
    api.get<{ data: Member[] }>("/api/members", token),
  ]);

  return {
    entries: attendanceResult.data?.entries ?? [],
    todayCount: attendanceResult.data?.todayCount ?? 0,
    total: attendanceResult.data?.total ?? 0,
    members: membersResult.data ?? [],
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const memberId = form.get("memberId") as string;
  const at = form.get("at") as string | null;

  const result = await api.post(
    `/api/members/${memberId}/attendance`,
    at ? { at } : {},
    token
  );
  return { success: result.success, message: (result as any).message ?? null };
}

const PLAN_BADGE: Record<string, string> = {
  premium:  "bg-amber-100 text-amber-700 border border-amber-200",
  standard: "bg-orange-100 text-orange-700 border border-orange-200",
  basic:    "bg-gray-100 text-gray-600 border border-gray-200",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return isToday ? `Today, ${formatTime(iso)}` : `${formatDate(iso)}, ${formatTime(iso)}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function Attendance({ loaderData }: Route.ComponentProps) {
  const { entries, todayCount, total, members } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today">("today");
  const [selectedMember, setSelectedMember] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isSubmitting = fetcher.state === "submitting";

  // Revalidate after successful check-in
  if (fetcher.state === "idle" && (fetcher.data as any)?.success && revalidator.state === "idle") {
    revalidator.revalidate();
  }

  const filteredEntries = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries.filter((e) => {
      if (filter === "today" && !isToday(e.at)) return false;
      if (q && !e.memberName.toLowerCase().includes(q) && !e.memberEmail.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, search, filter]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return members.slice(0, 20);
    return members
      .filter(
        (m) =>
          `${m.user.firstName} ${m.user.lastName}`.toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [members, memberSearch]);

  const selectedMemberName = useMemo(() => {
    if (!selectedMember) return "";
    const m = members.find((m) => m._id === selectedMember);
    return m ? `${m.user.firstName} ${m.user.lastName}` : "";
  }, [selectedMember, members]);

  const handleCheckIn = () => {
    if (!selectedMember) return;
    const fd = new FormData();
    fd.append("memberId", selectedMember);
    fetcher.submit(fd, { method: "post" });
    setSelectedMember("");
    setMemberSearch("");
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track and log member check-ins</p>
        </div>
      </div>

      <div className="p-8 space-y-5">
        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Today's check-ins", value: todayCount, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
            { label: "Total visits (all time)", value: total, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Total members", value: members.length, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border ${s.border} p-5 flex items-center gap-4`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-sm font-medium text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Check-in bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-end gap-4">
          <div className="flex-1 max-w-sm">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Log a check-in</label>
            <div className="relative">
              <div
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent"
                onClick={() => setDropdownOpen(true)}
              >
                {selectedMember ? (
                  <>
                    <span className="flex-1 text-gray-900 font-medium truncate">{selectedMemberName}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedMember(""); setMemberSearch(""); }}
                      className="text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm"
                      placeholder="Search member by name or email…"
                      value={memberSearch}
                      onChange={(e) => { setMemberSearch(e.target.value); setDropdownOpen(true); setSelectedMember(""); }}
                      onFocus={() => setDropdownOpen(true)}
                    />
                  </>
                )}
              </div>

              {dropdownOpen && !selectedMember && (
                <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 max-h-56 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 px-4 py-3 text-center">No members found</p>
                  ) : filteredMembers.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onMouseDown={() => { setSelectedMember(m._id); setDropdownOpen(false); setMemberSearch(""); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-orange-700 text-xs font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg,#fed7aa,#fdba74)" }}
                      >
                        {m.user.firstName[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.user.firstName} {m.user.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{m.user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedMember || isSubmitting}
            onClick={handleCheckIn}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shrink-0"
            style={{
              background: !selectedMember || isSubmitting ? "rgba(249,115,22,0.4)" : "linear-gradient(135deg,#f59e0b,#f97316)",
              boxShadow: !selectedMember || isSubmitting ? "none" : "0 4px 12px rgba(249,115,22,0.35)",
              cursor: !selectedMember || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Logging…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Check In</>
            )}
          </button>

          {(fetcher.data as any)?.success === false && (
            <p className="text-xs text-red-600 font-medium">{(fetcher.data as any).message ?? "Failed to record check-in."}</p>
          )}
          {(fetcher.data as any)?.success === true && (
            <p className="text-xs text-emerald-600 font-medium">Check-in recorded!</p>
          )}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-52">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
              {(["today", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-xs font-semibold transition ${filter === f ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >
                  {f === "today" ? "Today" : "All time"}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-400 ml-auto shrink-0">
              {filteredEntries.length} record{filteredEntries.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                {filter === "today" ? "No check-ins today yet." : "No attendance records found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Check-in Time</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEntries.map((entry, i) => (
                    <tr key={entry.entryId as string} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-orange-700 text-xs font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg,#fed7aa,#fdba74)" }}
                          >
                            {entry.memberName[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{entry.memberName}</p>
                            <p className="text-xs text-gray-400">{entry.memberEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PLAN_BADGE[entry.membershipType] ?? "bg-gray-100 text-gray-600"}`}>
                          {entry.membershipType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap font-medium">
                        {formatTime(entry.at)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {isToday(entry.at) ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold">Today</span>
                        ) : (
                          formatDate(entry.at)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
