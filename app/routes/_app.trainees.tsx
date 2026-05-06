import { Link, redirect } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/_app.trainees";

type Trainee = {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  membershipType: "basic" | "standard" | "premium";
  membershipEnd: string;
  isActive: boolean;
  goal?: { primary?: string };
  physique?: { height?: number; weight?: number };
};

const PLAN_BADGE: Record<string, string> = {
  basic:    "bg-gray-100 text-gray-600",
  standard: "bg-blue-50 text-blue-600",
  premium:  "bg-amber-50 text-amber-600",
};

const GOAL_LABEL: Record<string, string> = {
  "weight-loss":       "Weight Loss",
  "muscle-gain":       "Muscle Gain",
  "endurance":         "Endurance",
  "flexibility":       "Flexibility",
  "general-fitness":   "General Fitness",
  "rehabilitation":    "Rehabilitation",
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);

  if (session.get("role") === "admin") throw redirect("/members");

  const token = session.get("token")!;
  const result = await api.get<{ data: Trainee[] }>("/api/members/my-members", token);

  return { trainees: result.success ? (result.data ?? []) : [] };
}

export default function MyTrainees({ loaderData }: Route.ComponentProps) {
  const { trainees } = loaderData;
  const [search, setSearch] = useState("");

  const today = new Date();

  const filtered = trainees.filter((t) => {
    const name = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || t.user.email.toLowerCase().includes(q) || (t.user.phone ?? "").includes(q);
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Trainees</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {trainees.length} member{trainees.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      <div className="p-8 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg className="w-12 h-12 text-muted-foreground/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-muted-foreground">
              {trainees.length === 0
                ? "No trainees assigned yet — ask your admin to assign members to you."
                : "No trainees match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const name = `${t.user.firstName} ${t.user.lastName}`;
              const initials = (t.user.firstName[0] ?? "") + (t.user.lastName[0] ?? "");
              const daysLeft = Math.ceil(
                (new Date(t.membershipEnd).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const expired = daysLeft <= 0;

              return (
                <Link
                  key={t._id}
                  to={`/members/${t._id}`}
                  className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-3"
                >
                  {/* Top row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {initials.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{t.user.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${PLAN_BADGE[t.membershipType] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.membershipType}
                    </span>
                  </div>

                  {/* Goal */}
                  {t.goal?.primary && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {GOAL_LABEL[t.goal.primary] ?? t.goal.primary}
                    </div>
                  )}

                  {/* Physique */}
                  {(t.physique?.height || t.physique?.weight) && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {t.physique.height && <span>{t.physique.height} cm</span>}
                      {t.physique.weight && <span>{t.physique.weight} kg</span>}
                      {t.physique.height && t.physique.weight && (
                        <span>BMI {(t.physique.weight / ((t.physique.height / 100) ** 2)).toFixed(1)}</span>
                      )}
                    </div>
                  )}

                  {/* Membership status */}
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg w-fit ${
                    expired
                      ? "bg-red-50 text-red-500"
                      : daysLeft <= 7
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {expired ? "Expired" : daysLeft <= 7 ? `Expires in ${daysLeft}d` : "Active"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
