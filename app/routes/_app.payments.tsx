import { Form, useNavigation } from "react-router";
import { useState, useMemo } from "react";
import type { Route } from "./+types/_app.payments";
import { paymentSchema, parseErrors, type FieldErrors } from "~/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

type Payment = {
  _id: string;
  member: { name: string; email: string };
  plan: { name: string };
  amount: number;
  method: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  note?: string;
};

type Member = { _id: string; user: { firstName: string; lastName: string; email: string } };
type Plan   = { _id: string; name: string; price: number };

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const [paymentsRes, membersRes, plansRes] = await Promise.all([
    api.get<{ data: Payment[]; summary: { totalCollected: number; pending: number; overdue: number } }>("/api/payments", token),
    api.get<{ data: Member[] }>("/api/members", token),
    api.get<{ data: Plan[] }>("/api/plans", token),
  ]);

  return {
    payments: paymentsRes.data ?? [],
    summary:  paymentsRes.summary ?? { totalCollected: 0, pending: 0, overdue: 0 },
    members:  membersRes.data ?? [],
    plans:    plansRes.data ?? [],
  };
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const form = await request.formData();
  const raw = {
    memberId: (form.get("memberId") as string) ?? "",
    planId:   (form.get("planId")   as string) ?? "",
    amount:   (form.get("amount")   as string) ?? "",
    method:   (form.get("method")   as string) ?? "",
    date:     (form.get("date")     as string) ?? "",
    note:     (form.get("note")     as string) ?? "",
  };

  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { fields: parseErrors(parsed.error) as FieldErrors, error: null };
  }

  const result = await api.post<{ data: unknown }>("/api/payments", parsed.data, token);
  if (!result.success) {
    return { fields: null, error: result.message ?? "Failed to record payment." };
  }

  return redirect("/payments");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  paid:    "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  overdue: "bg-red-50 text-red-500",
};

const METHOD_LABEL: Record<string, string> = {
  cash:          "Cash",
  card:          "Card",
  upi:           "UPI",
  bank_transfer: "Bank Transfer",
  cheque:        "Cheque",
};

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordModal({
  members,
  plans,
  onClose,
  actionData,
}: {
  members: Member[];
  plans: Plan[];
  onClose: () => void;
  actionData: any;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedPlan, setSelectedPlan]     = useState<Plan | null>(null);
  const [showDropdown, setShowDropdown]     = useState(false);

  const fields = actionData?.fields as FieldErrors | null;
  const error  = actionData?.error  as string | null;
  const err    = (name: string) => fields?.[name];

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        `${m.user.firstName} ${m.user.lastName}`.toLowerCase().includes(q) ||
        m.user.email.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Record Payment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Form method="post" className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Member search */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Member <span className="text-red-500">*</span>
            </label>
            <input type="hidden" name="memberId" value={selectedMember?._id ?? ""} />
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email…"
                value={selectedMember ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}` : memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setSelectedMember(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${err("memberId") ? "border-red-400" : "border-border"}`}
              />
              {selectedMember && (
                <button
                  type="button"
                  onClick={() => { setSelectedMember(null); setMemberSearch(""); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {showDropdown && !selectedMember && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredMembers.slice(0, 8).map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => { setSelectedMember(m); setShowDropdown(false); }}
                      className="w-full text-left px-3 py-2.5 hover:bg-accent text-sm transition"
                    >
                      <p className="font-medium text-foreground">{m.user.firstName} {m.user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <FieldErr msg={err("memberId")} />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Plan <span className="text-red-500">*</span>
            </label>
            <input type="hidden" name="planId" value={selectedPlan?._id ?? ""} />
            <select
              onChange={(e) => {
                const plan = plans.find((p) => p._id === e.target.value) ?? null;
                setSelectedPlan(plan);
              }}
              defaultValue=""
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${err("planId") ? "border-red-400" : "border-border"}`}
            >
              <option value="" disabled>Select a plan…</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.name} — ₹{p.price.toLocaleString("en-IN")}</option>
              ))}
            </select>
            <FieldErr msg={err("planId")} />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              name="amount"
              type="number"
              min={1}
              defaultValue={selectedPlan?.price ?? ""}
              key={selectedPlan?._id}
              placeholder="0"
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${err("amount") ? "border-red-400" : "border-border"}`}
            />
            <FieldErr msg={err("amount")} />
          </div>

          {/* Method */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="method"
              defaultValue=""
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${err("method") ? "border-red-400" : "border-border"}`}
            >
              <option value="" disabled>Select method…</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
            <FieldErr msg={err("method")} />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Date
            </label>
            <input
              name="date"
              type="date"
              defaultValue={today}
              max={today}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
              Note
            </label>
            <input
              name="note"
              type="text"
              placeholder="Optional remark…"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : "Record Payment"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              Cancel
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Payments({ loaderData, actionData }: Route.ComponentProps) {
  const { payments, summary, members, plans } = loaderData;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-full bg-gray-50 text-gray-900">
      {showModal && (
        <RecordModal
          members={members}
          plans={plans}
          onClose={() => setShowModal(false)}
          actionData={actionData}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
          <h1 className="text-xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track membership payments and dues.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Record Payment
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 pb-16">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
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
              color: "bg-red-50 text-red-500",
            },
          ].map((card) => (
            <div key={card.label} className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Payments table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Transaction history</h2>
            <span className="text-xs text-muted-foreground">{payments.length} record{payments.length !== 1 ? "s" : ""}</span>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="font-medium">No payments recorded</p>
              <p className="text-sm mt-1 text-muted-foreground/70">Click "Record Payment" to log the first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Member</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Method</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{p.member.name}</p>
                        <p className="text-muted-foreground text-xs">{p.member.email}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{p.plan.name}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {METHOD_LABEL[p.method] ?? p.method}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(p.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[p.status] ?? ""}`}>
                          {p.status}
                        </span>
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
